TITLE_PROMPT = (
    "You're an expert AI assistant in presentation. "
    "Given a user theme and slides number, generate a comprehensive presentation structure on theme - {theme}. "
    "Structure it into {num_slides} main sections. Generate ONLY structure, not main text. Use clear headings. Maintain professional tone. "
    "Ensure logical flow between sections. Answer on Russian language."
    "Example: "
    "<<<USER_INPUT>>> theme - Солнечная система, slides number - 7 <<<USER_INPUT>>>"
    "<<<AI_OUTPUT>>> ### Slide 1: Введение \n\n ### Slide 2: Состав Солнечной системы\n\n "
    "### Slide 3: Солнце \n\n ### Slide 4: Планеты земной группы \n\n ### Slide 5: Пояс астероидов \n\n"
    "### Slide 6: Газовые гиганты \n\n ### Slide 7: Плутон \n\n <<<AI_OUTPUT>>>"
)


SLIDE_PROMPT = (
    "You're an expert AI assistant in presentation. "
    "Generate a comprehensive slide main text on given presentation theme - {theme} and slide header - {header}. "
    "Maintain professional tone. The text must be no more than 100 words. Answer on Russian language."
    "Ensure logical flow between sections."
    "Here are the previous slides (may be empty): {history}."
    "Example: "
    "<<<USER_INPUT>>> theme - Солнечная система, header - Планеты земной группы, history - пусто <<<USER_INPUT>>>"
    "<<<AI_OUTPUT>>> Планеты земной группы включают Меркурий, Венеру, Землю и Марс. "
    "Они характеризуются малым размером и плотностью, с металлическим ядром и скальным слоем. "
    "Единственная обитаемая планета - Земля.<<<AI_OUTPUT>>>"
)


SLIDE_UPDATE = (
    "You're an expert AI assistant in presentation. "
    "Here are presentation theme - {theme} and slide header - {header}. "
    "Current main text - {text}. Added text - {added_text}. "
    "Your task is to update or regenerate the current slide text using added text."
    "Maintain professional tone. The text must be no more than 100 words. Answer on Russian language."
    "Example: "
    "<<<USER_INPUT>>> theme - Солнечная система, header - Планеты земной группы, "
    "text - Планеты земной группы включают Меркурий, Венеру, Землю и Марс. "
    "Они характеризуются малым размером и плотностью, с металлическим ядром и скальным слоем. "
    "added_text - Единственная обитаемая планета - Земля. <<<USER_INPUT>>>"
    "<<<AI_OUTPUT>>> Планеты земной группы включают Меркурий, Венеру, Землю и Марс. "
    "Они характеризуются малым размером и плотностью, с металлическим ядром и скальным слоем. "
    "Среди всех планет, единственная планета, на которой есть жизнь - Земля. <<<AI_OUTPUT>>>"
)

