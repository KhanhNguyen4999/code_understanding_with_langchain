import os
import subprocess

import uvicorn
from fastapi import FastAPI, Header, HTTPException, Depends, Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.responses import JSONResponse
from pydantic import BaseModel

# Import các modules từ thư viện LangChain
from langchain.document_loaders import TextLoader
from langchain.text_splitter import CharacterTextSplitter, Language, RecursiveCharacterTextSplitter
from langchain.embeddings.openai import OpenAIEmbeddings
from langchain.vectorstores import DeepLake
from langchain.chat_models import ChatOpenAI, AzureChatOpenAI
from langchain.chains import ConversationalRetrievalChain
from langchain.chains import RetrievalQA
from langchain import PromptTemplate
from langchain.callbacks import StdOutCallbackHandler
from dotenv import load_dotenv


# Load environment variables from .env file
load_dotenv()

# Khởi tạo embeddings với các tham số cần thiết
embeddings = OpenAIEmbeddings(
    deployment="text-embedding-ada-002",
    model="text-embedding-ada-002",
    openai_api_base="https://genaiopenai.openai.azure.com/",
    openai_api_type="azure",
    disallowed_special=(),
    chunk_size=16
)

# Các biến cố định được sử dụng trong ứng dụng
BASE_URL = "https://genaiopenai.openai.azure.com/"
API_KEY = "c19c42b0cd4b41eba73da41b1710d652"
DEPLOYMENT_NAME = "gpt-35-turbo"
model = AzureChatOpenAI(
    openai_api_base=BASE_URL,
    openai_api_version="2023-05-15",
    deployment_name=DEPLOYMENT_NAME,
    openai_api_key=API_KEY,
    openai_api_type="azure",
)

# Mẫu prompt cho phần trả lời câu hỏi (dựa vào ngữ cảnh và câu hỏi)
CONDENSE_PROMPT_TEMPLATE = """You are a chatbot with the Code Understanding task, having a conversation with a human. Given the following conversation and a follow-up question, please rephrase the follow-up question to make it a standalone question in its original language.
Chat History:

{chat_history}
Follow Up Input: {question}
Standalone question:"""

CONDENSEprompt = PromptTemplate(input_variables=["chat_history", "question"], template=CONDENSE_PROMPT_TEMPLATE)

QA_PROMPT_TEMPLATE = """
System: You are a chatbot having a conversation with a human. You may need to go through these code files of the company and respond with code snippets and analysis. Given the following extracted parts of a long document and a question, create a final answer. Always remember to provide code snippets when applicable.

If you don't know the answer, simply state that you don't know. Do not attempt to make up an answer. The answer's language must be translated into the original language of the human question.
----------------
{context}

Human: {question}
Chatbot:
"""

# Khởi tạo PromptTemplate cho việc xử lý câu hỏi và ngữ cảnh
QA_PROMPT = PromptTemplate(input_variables=["context", "question"], template=QA_PROMPT_TEMPLATE)

# Hàm để thực hiện clone một repository từ URL vào một thư mục đích
def git_clone(repository_url, target_directory):
    """
        Sao chép repository từ URL vào thư mục đích.

        Parameters:
        - repository_url (str): URL của repository.
        - target_directory (str): Đường dẫn thư mục đích.

    """
    try:
        subprocess.run(['git', 'clone', repository_url, target_directory], check=True)
        print(f"Repository cloned successfully to {target_directory}")
    except subprocess.CalledProcessError as error:
        print(f"Failed to clone the repository: {error}")

def filter(x):
    # filter based on source code
    if "com.google" in x["text"].data()["value"]:
        return False

    # filter based on path e.g. extension
    metadata = x["metadata"].data()["value"]
    return "scala" in metadata["source"] or "py" in metadata["source"]

# Lớp Embedding để đại diện cho thông tin về việc lưu dữ liệu từ repository vào vector store
class Embedding(BaseModel):
    gitUrl: str
    idSession: str

# Lớp QA để đại diện cho câu hỏi từ người dùng và câu trả lời từ ứng dụng
class QA(BaseModel):
    question: str
    idSession: str

# Lưu trữ lịch sử trò chuyện theo idSession
chat_history = {}

# Khởi tạo ứng dụng FastAPI
app = FastAPI()

# API endpoint để tải dữ liệu từ repository vào hệ thống
@app.post("/load")
async def load(request: Embedding):
    """
        Tải dữ liệu từ repository Git vào hệ thống và nhúng chúng để sử dụng trong trò chuyện.

        Parameters:
        - request (Embedding): Đối tượng chứa thông tin về URL của repository và id phiên.

        Returns:
        - Trạng thái thực hiện (Thành công hoặc thông báo lỗi).

    """
    gitUrl = request.gitUrl
    idSession = request.idSession
    if not os.path.exists(idSession):
        # Tạo thư mục mới
        os.makedirs(idSession)
        print(f"Directory '{idSession}' created successfully.")
        try:
            subprocess.run(['git', 'clone', gitUrl, idSession], check=True)
            print(f"Repository cloned successfully to {idSession}")
        except subprocess.CalledProcessError as error:
            return JSONResponse(status_code=502, content={"message": "Cannot clone this repository"})
    else:
        print(f"Directory '{idSession}' already exists.")

    # Danh sách các ngôn ngữ được hỗ trợ
    languages = ['.cpp', '.go', '.java', '.js', '.php', '.proto', '.py', '.rst', '.rb', '.rs', '.scala', '.swift', '.md', '.tex', '.html', '.sol', 'other']
    language_docs = {}
    for language in languages:
        language_docs[language] = []

    root_dir = idSession
    docs = []
    for dirpath, dirnames, filenames in os.walk(root_dir):
        for file in filenames:
            print(file)
            try:
                loader = TextLoader(os.path.join(dirpath, file), encoding="utf-8").load_and_split()
                for language in languages:
                    if file.endswith(language):
                        language_docs[language].extend(loader)
                        break
                else:
                    language_docs["other"].extend(loader)
                # docs.extend(loader.load_and_split())
            except Exception as e:
                pass
    texts = []

    # Thêm các văn bản đã chia vào danh sách văn bản để nhúng
    # Chia văn bản theo ngôn ngữ
    # Tạo đường dẫn đến thư mục lưu trữ dữ liệu đã nhúng
    texts.extend(RecursiveCharacterTextSplitter.from_language(
        language=Language.CPP, chunk_size=1000, chunk_overlap=0
    ).split_documents(language_docs[".cpp"]))

    texts.extend(RecursiveCharacterTextSplitter.from_language(
        language=Language.PYTHON, chunk_size=1000, chunk_overlap=0
    ).split_documents(language_docs[".py"]))

    texts.extend(RecursiveCharacterTextSplitter.from_language(
        language=Language.GO, chunk_size=1000, chunk_overlap=0
    ).split_documents(language_docs[".go"]))

    texts.extend(RecursiveCharacterTextSplitter.from_language(
        language=Language.JAVA, chunk_size=1000, chunk_overlap=0
    ).split_documents(language_docs[".java"]))

    texts.extend(RecursiveCharacterTextSplitter.from_language(
        language=Language.JS, chunk_size=1000, chunk_overlap=0
    ).split_documents(language_docs[".js"]))

    texts.extend(RecursiveCharacterTextSplitter.from_language(
        language=Language.PHP, chunk_size=1000, chunk_overlap=0
    ).split_documents(language_docs[".php"]))

    texts.extend(RecursiveCharacterTextSplitter.from_language(
        language=Language.PROTO, chunk_size=1000, chunk_overlap=0
    ).split_documents(language_docs[".proto"]))

    texts.extend(RecursiveCharacterTextSplitter.from_language(
        language=Language.RST, chunk_size=1000, chunk_overlap=0
    ).split_documents(language_docs[".rst"]))

    texts.extend(RecursiveCharacterTextSplitter.from_language(
        language=Language.RUBY, chunk_size=1000, chunk_overlap=0
    ).split_documents(language_docs[".rb"]))

    texts.extend(RecursiveCharacterTextSplitter.from_language(
        language=Language.RUST, chunk_size=1000, chunk_overlap=0
    ).split_documents(language_docs[".rs"]))

    texts.extend(RecursiveCharacterTextSplitter.from_language(
        language=Language.SCALA, chunk_size=1000, chunk_overlap=0
    ).split_documents(language_docs[".scala"]))

    texts.extend(RecursiveCharacterTextSplitter.from_language(
        language=Language.SWIFT, chunk_size=1000, chunk_overlap=0
    ).split_documents(language_docs[".swift"]))

    texts.extend(RecursiveCharacterTextSplitter.from_language(
        language=Language.MARKDOWN, chunk_size=1000, chunk_overlap=0
    ).split_documents(language_docs[".md"]))

    texts.extend(RecursiveCharacterTextSplitter.from_language(
        language=Language.MARKDOWN, chunk_size=1000, chunk_overlap=0
    ).split_documents(language_docs[".tex"]))

    texts.extend(RecursiveCharacterTextSplitter.from_language(
        language=Language.HTML, chunk_size=1000, chunk_overlap=0
    ).split_documents(language_docs[".html"]))

    texts.extend(RecursiveCharacterTextSplitter.from_language(
        language=Language.SOL, chunk_size=1000, chunk_overlap=0
    ).split_documents(language_docs[".sol"]))

    texts.extend(RecursiveCharacterTextSplitter.from_language(
        language=Language.SOL, chunk_size=1000, chunk_overlap=0
    ).split_documents(language_docs[".sol"]))

    texts.extend(CharacterTextSplitter(
        chunk_size=1000, chunk_overlap=0
    ).split_documents(language_docs["other"]))

    username = "khacduymath"  
    dataset_path = idSession + "_dataset"
    db = DeepLake(
        dataset_path=dataset_path,
        embedding_function=embeddings,
        overwrite=True,
    )
    db.add_documents(texts)
    chat_history[idSession] = []

    return {"status": "Successfully"}

# API endpoint để trò chuyện với chatbot
@app.post("/chat")
async def chat(request: QA):
    """
        Trò chuyện với chatbot và nhận câu trả lời cho câu hỏi đã đưa ra.

        Parameters:
        - request (QA): Đối tượng chứa câu hỏi và id phiên.

        Returns:
        - dict: Câu hỏi và câu trả lời từ chatbot.

    """
    question = request.question
    idSession = request.idSession
    dataset_path = idSession + "_dataset"
    db = DeepLake(dataset_path=dataset_path, read_only=True, embedding_function=embeddings)

    # Cấu hình retriever cho quá trình tìm kiếm dữ liệu
    retriever = db.as_retriever()
    retriever.search_kwargs["distance_metric"] = "cos"
    retriever.search_kwargs["fetch_k"] = 100
    retriever.search_kwargs["maximal_marginal_relevance"] = True
    retriever.search_kwargs["k"] = 7
    retriever.search_kwargs['filter'] = filter

    handler = StdOutCallbackHandler()
    qa = ConversationalRetrievalChain.from_llm(model, retriever=retriever, callbacks=[handler], condense_question_prompt = CONDENSEprompt, combine_docs_chain_kwargs={"prompt": QA_PROMPT})

    result = qa({"question": question, "chat_history": chat_history[idSession]})
    chat_history[idSession].append((question, result["answer"]))
    print(f"-> **Question**: {question} \n")
    print(f"**Answer**: {result['answer']} \n")
    return {"Question": question, "Answer": result['answer']}

# Khởi chạy ứng dụng FastAPI trên cổng 8080
if __name__ == "__main__":
    config = uvicorn.Config("code:app", host="0.0.0.0", reload=True, port=8080, log_level="info")
    server = uvicorn.Server(config)
    server.run()