import warnings

warnings.filterwarnings('ignore')
from langchain_core.prompts import ChatPromptTemplate
from langchain_ollama import ChatOllama
from ml.prompt import SLIDE_PROMPT, SLIDE_UPDATE, TITLE_PROMPT, SUMMARIZE_PROMPT
from pydantic import BaseModel, Field


llm = ChatOllama(model="qwen2.5:14b", temperature=0.0)


# def get_presentation_content(theme, num_slides = 5):

#     prompt = ChatPromptTemplate.from_messages(
#         [
#             ("system", TITLE_PROMPT),
#             ("user", "{theme}, {num_slides}"),
#         ]
#     )
#     messages = prompt.invoke({"theme": theme, "num_slides": num_slides})
#     response = llm.invoke(messages)
#     answer = response.content

#     return answer


class Slide(BaseModel):
    number: int = Field(description="Номер слайда")
    header: str = Field(description="Заголовок слайда")


class SlidesList(BaseModel):
    slides: dict[str, str] = Field(description="Словарь слайдов")


def get_presentation_content_structured(theme, num_slides = 5, content=""):

    if content != "":
        prompt = ChatPromptTemplate.from_messages(
            [
                ("system", TITLE_PROMPT),
                ("user", "{theme}, {num_slides}, {content}"),
            ]
        )
        messages = prompt.invoke({"theme": theme, "num_slides": num_slides, "content": content})
    else:
        prompt = ChatPromptTemplate.from_messages(
            [
                ("system", TITLE_PROMPT),
                ("user", "{theme}, {num_slides}"),
            ]
        )
        messages = prompt.invoke({"theme": theme, "num_slides": num_slides})
    model_with_structure = llm.with_structured_output(SlidesList)
    structured_output = model_with_structure.invoke(messages)
    
    if structured_output:
        return structured_output.model_dump()
    else:
        return {}


def get_summary(context, num_slides=5):
    prompt = ChatPromptTemplate.from_messages(
        [
            ("system", SUMMARIZE_PROMPT),
            ("user", "{num_slides}, {context}"),
        ]
    )
    messages = prompt.invoke({"num_slides": num_slides, "context": context})
    response = llm.invoke(messages)
    answer = response.content
    return answer


def get_slide(theme, header, history = "", context = ""):

    prompt = ChatPromptTemplate.from_messages(
        [
            ("system", SLIDE_PROMPT),
            ("user", "{theme}, {header}, {history}, {context}"),
        ]
    )
    messages = prompt.invoke({"theme": theme, "header": header, "history": history, "context": context})
    response = llm.invoke(messages)
    answer = response.content

    return answer


def update_slide(theme, header, text, added_text = ""):

    prompt = ChatPromptTemplate.from_messages(
        [
            ("system", SLIDE_UPDATE),
            ("user", "{theme}, {header}, {text}, {added_text}"),
        ]
    )
    messages = prompt.invoke({"theme": theme, "header": header, "text": text, "added_text": added_text})
    response = llm.invoke(messages)
    answer = response.content

    return answer
