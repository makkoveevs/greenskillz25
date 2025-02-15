import warnings
warnings.filterwarnings('ignore')
from langchain_text_splitters.character import RecursiveCharacterTextSplitter
from langchain_unstructured import UnstructuredLoader


# from langchain_ollama import OllamaEmbeddings
# from langchain_core.vectorstores import InMemoryVectorStore
# llm = ChatOllama(model="qwen2.5:14b", temperature=0.05)
# embeddings = OllamaEmbeddings(model="bge-m3")
# vector_store = InMemoryVectorStore(embeddings)


def parse_file_in_document(file):
    loader = UnstructuredLoader(file)
    document = loader.load()
    return document


def get_text_from_document(document):
    text = ''
    for item in document:
        text += item.page_content
    text = text.replace('\ufffe', "").replace('\r\n', " ")
    return text


def create_vector_store(vector_store, document):
    r_splitter = RecursiveCharacterTextSplitter(
        chunk_size=4048,
        chunk_overlap=256,
        separators=["\n\n", "\n", "(?<=\. )", " ", ""]
    )
    chunks = r_splitter.split_documents(document)
    _ = vector_store.add_documents(documents=chunks)
    return vector_store


def get_rag_context(vector_store, slide_header):
    retrieved_docs = vector_store.similarity_search(slide_header, k=3)
    docs_content = "\n\n".join(doc.page_content for doc in retrieved_docs)
    return docs_content
