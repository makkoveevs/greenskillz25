import warnings

warnings.filterwarnings('ignore')
from langchain_core.prompts import ChatPromptTemplate
from langchain_ollama import ChatOllama
from prompt import SLIDE_PROMPT, SLIDE_UPDATE, TITLE_PROMPT
from pydantic import BaseModel, Field


llm = ChatOllama(model="qwen2.5:14b", temperature=0.0, base_url=f"http://91.236.197.228:11434")


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


class Slide(BaseModel):
    number: int = Field(description="Номер слайда")
    header: str = Field(description="Заголовок слайда")


class SlidesList(BaseModel):
    slides: dict[str, str] = Field(description="Словарь слайдов")


def get_presentation_content_structured(theme, num_slides = 5):

    prompt = ChatPromptTemplate.from_messages(
        [
            ("system", TITLE_PROMPT),
            ("user", "{theme}, {num_slides}"),
        ]
    )
    messages = prompt.invoke({"theme": theme, "num_slides": num_slides})
    model_with_structure = llm.with_structured_output(SlidesList)
    structured_output = model_with_structure.invoke(messages)
    
    return structured_output.model_dump()


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