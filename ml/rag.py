import warnings
warnings.filterwarnings('ignore')
from langchain_text_splitters.character import RecursiveCharacterTextSplitter
from langchain_community.document_loaders import PyPDFium2Loader


# from langchain_ollama import OllamaEmbeddings
# from langchain_core.vectorstores import InMemoryVectorStore
# llm = ChatOllama(model="qwen2.5:14b", temperature=0.05)
# embeddings = OllamaEmbeddings(model="bge-m3")
# vector_store = InMemoryVectorStore(embeddings)

def create_vector_store(vector_store, file):
    r_splitter = RecursiveCharacterTextSplitter(
        chunk_size=4048,
        chunk_overlap=256,
        separators=["\n\n", "\n", "(?<=\. )", " ", ""]
    )
    loader = PyPDFium2Loader(file)
    some_text = []
    for page in loader.lazy_load():
        some_text.append(page)
    chunks = r_splitter.split_documents(some_text)
    _ = vector_store.add_documents(documents=chunks)
    return vector_store


def rag_slide(vector_store, slide_header):
    retrieved_docs = vector_store.similarity_search(slide_header)
    docs_content = "\n\n".join(doc.page_content for doc in retrieved_docs)
    return docs_content