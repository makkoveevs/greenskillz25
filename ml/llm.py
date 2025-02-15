import warnings
warnings.filterwarnings('ignore')
from langchain_ollama import ChatOllama
from langchain_core.prompts import ChatPromptTemplate
from prompt import TITLE_PROMPT, SLIDE_PROMPT, SLIDE_REGENERATE


llm = ChatOllama(model="qwen2.5:1.5b", temperature=0.0)


def get_presentation_content(theme, num_slides = 5):

    prompt = ChatPromptTemplate.from_messages(
        [
            ("system", TITLE_PROMPT),
            ("user", "{theme}, {num_slides}"),
        ]
    )
    messages = prompt.invoke({"theme": theme, "num_slides": num_slides})
    response = llm.invoke(messages)
    answer = response.content

    return answer


def get_slide(theme, header, history = ""):

    prompt = ChatPromptTemplate.from_messages(
        [
            ("system", SLIDE_PROMPT),
            ("user", "{theme}, {header}, {num_slides}"),
        ]
    )
    messages = prompt.invoke({"theme": theme, "header": header, "history": history})
    response = llm.invoke(messages)
    answer = response.content

    return answer
