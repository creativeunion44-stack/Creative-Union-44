import sys
from datetime import date, timedelta
from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.worksheet.datavalidation import DataValidation
from openpyxl.comments import Comment
from openpyxl.chart import LineChart, BarChart, Reference
from openpyxl.utils import get_column_letter

OUT = sys.argv[1]
T = date(2026, 11, 14)

F = "Arial"
BLUE = Font(name=F, color="0000FF")
BLACK = Font(name=F)
BOLD = Font(name=F, bold=True)
HDR = Font(name=F, bold=True, color="FFFFFF")
HFILL = PatternFill("solid", fgColor="4B3B8F")
INFILL = PatternFill("solid", fgColor="FFF6CC")
CALCFILL = PatternFill("solid", fgColor="EEEEF5")
TITLE = Font(name=F, bold=True, size=14)
thin = Side(style="thin", color="CCCCCC")
BOX = Border(left=thin, right=thin, top=thin, bottom=thin)
WRAP = Alignment(wrap_text=True, vertical="top")

wb = Workbook()

def sheet(name, headers, widths, input_cols, n_rows, first=True):
    ws = wb.active if first else wb.create_sheet(name)
    ws.title = name
    for i, (h, w) in enumerate(zip(headers, widths), 1):
        c = ws.cell(row=1, column=i, value=h)
        c.font = HDR; c.fill = HFILL; c.alignment = Alignment(wrap_text=True, vertical="center"); c.border = BOX
        ws.column_dimensions[get_column_letter(i)].width = w
    ws.row_dimensions[1].height = 34
    ws.freeze_panes = "A2"
    for r in range(2, n_rows + 2):
        for i in range(1, len(headers) + 1):
            c = ws.cell(row=r, column=i)
            c.border = BOX
            if i in input_cols:
                c.fill = INFILL; c.font = BLUE
            else:
                c.fill = CALCFILL; c.font = BLACK
    return ws

def dv(ws, rng, options):
    d = DataValidation(type="list", formula1='"' + ",".join(options) + '"', allow_blank=True)
    ws.add_data_validation(d); d.add(rng)

# ---------------- Как пользоваться ----------------
ws = wb.active
ws.title = "Как пользоваться"
ws.column_dimensions["A"].width = 30
ws.column_dimensions["B"].width = 95
ws["A1"] = "AI Life & Growth OS — ручная версия (этап 0)"; ws["A1"].font = TITLE
rows = [
    ("Зачем", "Проверить модель вклада на своей жизни до написания кода (ТЗ v3.2, раздел «До разработки — ручная версия»)."),
    ("Цвета", "Жёлтые ячейки с синим текстом — вводите сами. Серые — формулы, их не трогайте."),
    ("Пример", "Строки с примерами (ВНЖ, здоровье, бизнес, налоги) показывают формат. Замените их своими или удалите."),
    ("Каждый день (5 мин)", "1) Надиктуйте голосом в приложении Claude (проект «Life OS») или напишите всё, что вспомнили, — он вернёт строки для листа «Дела». 2) Отмечайте «сделано» и дату. 3) Вечером — оценка энергии на листе «Отметки»."),
    ("Каждую неделю (15 мин)", "1) Лист «Обзор недели». 2) Скопируйте строку «сегодня» в «Снимки» (Вставить → только значения). 3) Вставьте обзор в Claude — получите до 3 сигналов и главную цель недели."),
    ("Прогресс цели-проекта", "Σ (вес этапа × размер сделанных дел / размер всех дел этапа). Размер: S=1, M=2, L=4. Это «план выполнен на X%», а не вероятность результата."),
    ("Цель-состояние", "Индекс регулярности = взвешенное среднее min(сделано / ожидаемое, 1) за 28 дней. Ожидаемое = частота в день × активные дни (28 − паузы); неделя = /7, месяц = /30. Привычка с ожидаемым < 1 в индекс не входит. Визиты к врачу — дела типа «запись»: ожидаемо 1, сделано 0 или 1; перенос по вине клиники — просто новая дата, не пропуск."),
    ("Закрыть этап вручную", "Только с причиной: «достигнут другим способом» (этап = 100%), «изменён» (лишние дела переведите в «отменено»), «отменён» (вес этапа перераспределяется на остальные)."),
    ("Деньги", "Статусы «подтверждено», «ожидается», «гипотеза» нигде не складываются. Суммы в базовой валюте помечены «≈»."),
    ("Базовая валюта", "EUR"),
    ("Сегодня", "=TODAY()"),
]
for i, (a, b) in enumerate(rows, 3):
    ws.cell(row=i, column=1, value=a).font = BOLD
    c = ws.cell(row=i, column=2, value=b); c.font = BLACK; c.alignment = WRAP
ws["B12"].font = BLUE; ws["B12"].fill = INFILL
ws["B13"].number_format = "dd.mm.yyyy"
ws["B12"].comment = Comment("Ваша базовая валюта. Введено как допущение — поменяйте при необходимости.", "Claude")

# ---------------- Направления ----------------
A = sheet("Направления", ["ID", "Направление", "≈ часов за 7 дней", "Вклад в цели-проекты за 7 дней", "≈ часов без вклада за 7 дней"], [8, 32, 16, 22, 20], {1, 2}, 8, first=False)
areas = ["Здоровье и энергия", "Текущая жизнь и работа", "Бизнес", "Социальные и грантовые проекты", "Релокация", "Обязательства"]
for i, a in enumerate(areas, 2):
    A.cell(row=i, column=1, value=f"N{i-1}"); A.cell(row=i, column=2, value=a)
for r in range(2, 10):
    A.cell(row=r, column=3, value=f'=IF(A{r}="","",SUMIFS(Дела!$P:$P,Дела!$D:$D,A{r},Дела!$N:$N,"сделано",Дела!$O:$O,">="&(TODAY()-6)))').number_format = '"≈"0.0'
    A.cell(row=r, column=4, value=f'=IF(A{r}="","",SUMIFS(Дела!$S:$S,Дела!$D:$D,A{r},Дела!$N:$N,"сделано",Дела!$O:$O,">="&(TODAY()-6)))').number_format = "0.0%"
    A.cell(row=r, column=5, value=f'=IF(A{r}="","",SUMIFS(Дела!$P:$P,Дела!$D:$D,A{r},Дела!$N:$N,"сделано",Дела!$O:$O,">="&(TODAY()-6),Дела!$V:$V,"5. без вклада"))').number_format = '"≈"0.0'

# ---------------- Цели ----------------
G = sheet("Цели", ["ID", "Направление (ID)", "Цель", "Тип", "Старт", "Дедлайн", "Целевое значение", "Фин. категория",
                   "План выполнен на", "Нужный темп сегодня", "Отставание от темпа", "Дней без шага", "Регулярность (для состояния)",
                   "Факт (подтверждено) ≈", "Ожидается ≈", "Главная цель недели?"],
          [7, 12, 30, 15, 11, 11, 12, 20, 13, 13, 13, 11, 14, 14, 13, 12], {1, 2, 3, 4, 5, 6, 7, 8, 16}, 15, first=False)
dv(G, "D2:D16", ["проект", "состояние", "результат", "обязательство"])
dv(G, "H2:H16", ["прямой доход", "потенциальный доход", "ресурсы проекта", "развитие доходного потенциала", "управление активами", "защита от потерь", "нефинансовое", "не знаю"])
dv(G, "P2:P16", ["да", ""])
goals = [
    ("G1", "N5", "Получить ВНЖ", "проект", T - timedelta(days=30), date(2027, 9, 1), None, "нефинансовое", "да"),
    ("G2", "N1", "Быть здоровой и энергичной", "состояние", T - timedelta(days=30), None, None, "нефинансовое", ""),
    ("G3", "N3", "Доход бизнеса в месяц", "результат", T - timedelta(days=30), None, 3000, "потенциальный доход", ""),
    ("G4", "N4", "Грант на культурный проект", "проект", T - timedelta(days=20), date(2027, 2, 1), None, "ресурсы проекта", ""),
    ("G5", "N6", "Налоговые отчёты", "обязательство", None, None, None, "защита от потерь", ""),
]
for i, g in enumerate(goals, 2):
    for j, v in enumerate(g):
        col = [1, 2, 3, 4, 5, 6, 7, 8, 16][j]
        G.cell(row=i, column=col, value=v)
for r in range(2, 17):
    G[f"E{r}"].number_format = "dd.mm.yyyy"; G[f"F{r}"].number_format = "dd.mm.yyyy"
    G[f"I{r}"] = f'=IF(D{r}="проект",IFERROR(SUMIFS(Этапы!$M:$M,Этапы!$B:$B,A{r}),0),"")'
    G[f"I{r}"].number_format = "0%"
    G[f"J{r}"] = f'=IF(AND(D{r}="проект",ISNUMBER(E{r}),ISNUMBER(F{r})),MAX(0,MIN(1,(TODAY()-E{r})/MAX(1,F{r}-E{r}))),"")'
    G[f"J{r}"].number_format = "0%"
    G[f"K{r}"] = f'=IF(AND(ISNUMBER(I{r}),ISNUMBER(J{r})),I{r}-J{r},"")'
    G[f"K{r}"].number_format = '+0%;-0%;0%'
    G[f"L{r}"] = f'=IF(A{r}="","",IF(COUNTIFS(Дела!$E:$E,A{r},Дела!$N:$N,"сделано")=0,"нет шагов",TODAY()-_xlfn.MAXIFS(Дела!$O:$O,Дела!$E:$E,A{r},Дела!$N:$N,"сделано")))'
    vexp = f'COUNTIFS(Дела!$E:$E,A{r},Дела!$K:$K,"запись",Дела!$N:$N,"<>отменено",Дела!$J:$J,">="&(TODAY()-27),Дела!$J:$J,"<="&TODAY())'
    vdone = f'COUNTIFS(Дела!$E:$E,A{r},Дела!$K:$K,"запись",Дела!$N:$N,"сделано",Дела!$J:$J,">="&(TODAY()-27),Дела!$J:$J,"<="&TODAY())'
    G[f"M{r}"] = (f'=IF(D{r}="состояние",IFERROR((SUMIFS(Привычки!$M:$M,Привычки!$B:$B,A{r})+IF({vexp}>=1,MIN(1,{vdone}/{vexp}),0))'
                  f'/(SUMIFS(Привычки!$N:$N,Привычки!$B:$B,A{r})+IF({vexp}>=1,1,0)),""),"")')
    G[f"M{r}"].number_format = "0%"
    G[f"N{r}"] = f'=IF(A{r}="","",SUMIFS(Деньги!$H:$H,Деньги!$B:$B,A{r},Деньги!$I:$I,"подтверждено",Деньги!$J:$J,"доход")-SUMIFS(Деньги!$H:$H,Деньги!$B:$B,A{r},Деньги!$I:$I,"подтверждено",Деньги!$J:$J,"расход"))'
    G[f"O{r}"] = f'=IF(A{r}="","",SUMIFS(Деньги!$H:$H,Деньги!$B:$B,A{r},Деньги!$I:$I,"ожидается",Деньги!$J:$J,"доход")-SUMIFS(Деньги!$H:$H,Деньги!$B:$B,A{r},Деньги!$I:$I,"ожидается",Деньги!$J:$J,"расход"))'
    G[f"N{r}"].number_format = '"≈"#,##0;"≈-"#,##0;-'; G[f"O{r}"].number_format = '"≈"#,##0;"≈-"#,##0;-'
G["L1"].comment = Comment("Сколько дней прошло с последнего сделанного дела по цели. «Застой» = сигнал рефлексии.", "Claude")
G["J1"].comment = Comment("Линейный темп от старта до дедлайна. Только для целей-проектов с обеими датами.", "Claude")
G["G1"].comment = Comment("Для цели-результата: целевое значение в базовой валюте (пример €3 000/мес — условная цифра).", "Claude")

# ---------------- Этапы ----------------
M = sheet("Этапы", ["ID", "Цель (ID)", "Этап", "Вес", "Статус", "Причина закрытия", "Размер всех дел", "Размер сделанных",
                    "Выполнено этапа", "Вес после перераспределения", "Дел в этапе", "Подсказка", "Вклад этапа в цель"],
          [7, 10, 40, 8, 26, 30, 12, 12, 12, 14, 9, 26, 12], {1, 2, 3, 4, 5, 6}, 25, first=False)
dv(M, "E2:E26", ["активен", "достигнут другим способом", "изменён", "отменён"])
ms = [("M1", "G1", "Выбрать основание и проконсультироваться", 0.10),
      ("M2", "G1", "Собрать и перевести документы", 0.30),
      ("M3", "G1", "Финансовые доказательства и жильё", 0.25),
      ("M4", "G1", "Подать заявление", 0.20),
      ("M5", "G1", "Получить решение и карту", 0.15),
      ("M6", "G4", "Найти конкурс и проверить условия", 0.20),
      ("M7", "G4", "Написать и подать заявку", 0.60),
      ("M8", "G4", "Отчётность по гранту", 0.20)]
for i, m in enumerate(ms, 2):
    for j, v in enumerate(m, 1):
        M.cell(row=i, column=j, value=v)
    M.cell(row=i, column=5, value="активен")
M["E2"] = "достигнут другим способом"; M["F2"] = "Консультация уже была в 2025 году"
for r in range(2, 27):
    M[f"D{r}"].number_format = "0%"
    M[f"G{r}"] = f'=IF(A{r}="","",SUMIFS(Дела!$L:$L,Дела!$F:$F,A{r},Дела!$N:$N,"<>отменено",Дела!$K:$K,"<>привычка")+SUMIFS(Дела!$L:$L,Дела!$H:$H,A{r},Дела!$N:$N,"<>отменено",Дела!$K:$K,"<>привычка"))'
    M[f"H{r}"] = f'=IF(A{r}="","",SUMIFS(Дела!$L:$L,Дела!$F:$F,A{r},Дела!$N:$N,"сделано",Дела!$K:$K,"<>привычка")+SUMIFS(Дела!$L:$L,Дела!$H:$H,A{r},Дела!$N:$N,"сделано",Дела!$K:$K,"<>привычка"))'
    M[f"I{r}"] = f'=IF(A{r}="","",IF(E{r}="достигнут другим способом",1,IF(OR(G{r}="",G{r}=0),0,H{r}/G{r})))'
    M[f"I{r}"].number_format = "0%"
    M[f"J{r}"] = f'=IF(OR(A{r}="",E{r}="отменён"),0,IFERROR(D{r}/SUMIFS($D:$D,$B:$B,B{r},$E:$E,"<>отменён"),0))'
    M[f"J{r}"].number_format = "0%"
    M[f"K{r}"] = f'=IF(A{r}="","",COUNTIFS(Дела!$F:$F,A{r},Дела!$N:$N,"<>отменено")+COUNTIFS(Дела!$H:$H,A{r},Дела!$N:$N,"<>отменено"))'
    M[f"L{r}"] = f'=IF(A{r}="","",IF(AND(E{r}<>"активен",F{r}=""),"⚠ укажите причину закрытия",IF(AND(E{r}="активен",OR(G{r}="",G{r}=0)),"добавьте шаги — пустой этап = 0%","")))'
    M[f"M{r}"] = f'=IF(A{r}="","",J{r}*I{r})'
    M[f"M{r}"].number_format = "0.0%"
M["F1"].comment = Comment("Без причины этап закрыть нельзя (ТЗ, правила честности). Причина = история.", "Claude")

# ---------------- Дела ----------------
D = sheet("Дела", ["ID", "Создано", "Дело", "Направление (ID)", "Основная цель (ID)", "Этап (ID)", "Доп. цель (ID)", "Доп. этап (ID)",
                   "Привычка (ID)", "Срок", "Тип", "Баллы размера", "Размер S/M/L", "Статус", "Дата выполнения",
                   "≈ часов", "Заняло больше, ч", "Переносов", "Вклад в осн. цель (сейчас)", "Вклад в доп. цель (сейчас)", "Жду от кого", "Исход"],
          [7, 11, 40, 11, 11, 9, 10, 9, 10, 11, 13, 9, 9, 11, 12, 9, 11, 9, 13, 13, 16, 20], {1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 13, 14, 15, 17, 18, 21}, 150, first=False)
dv(D, "K2:K151", ["шаг", "привычка", "запись", "обязательство", "покупка"])
dv(D, "M2:M151", ["S", "M", "L"])
dv(D, "N2:N151", ["план", "сделано", "жду", "отменено"])
d = lambda n: T - timedelta(days=n)
tasks = [
    # id, created, text, area, goal, ms, g2, ms2, habit, due, type, size, status, done, more, moves, waiting
    ("T1", d(20), "Заказать перевод свидетельства о рождении", "N5", "G1", "M2", None, None, None, None, "шаг", "M", "сделано", d(3), None, 0, None),
    ("T2", d(20), "Поставить апостиль на документы", "N5", "G1", "M2", None, None, None, d(-14), "шаг", "L", "план", None, None, 2, None),
    ("T3", d(20), "Перевести диплом", "N5", "G1", "M2", None, None, None, None, "шаг", "M", "жду", None, None, 0, "переводчик"),
    ("T4", d(20), "Сделать копии паспорта", "N5", "G1", "M2", None, None, None, None, "шаг", "S", "сделано", d(10), None, 0, None),
    ("T5", d(20), "Записаться к нотариусу", "N5", "G1", "M2", None, None, None, None, "шаг", "S", "план", None, None, 4, None),
    ("T6", d(15), "Выписка из банка за 6 месяцев", "N5", "G1", "M3", None, None, None, None, "шаг", "S", "план", None, None, 0, None),
    ("T7", d(15), "Договор аренды на 12 месяцев", "N5", "G1", "M3", None, None, None, None, "шаг", "L", "план", None, None, 0, None),
    ("T8", d(15), "Заполнить анкету на подачу", "N5", "G1", "M4", None, None, None, None, "шаг", "M", "план", None, None, 0, None),
    ("T9", d(10), "Провести культурное мероприятие", "N4", "G4", "M7", "G3", None, None, d(5), "шаг", "L", "сделано", d(5), 5, 0, None),
    ("T10", d(10), "Написать бюджет заявки", "N4", "G4", "M7", None, None, None, d(-20), "шаг", "M", "план", None, None, 1, None),
    ("T11", d(9), "Тренировка", "N1", "G2", None, None, None, "H1", d(6), "привычка", "M", "сделано", d(6), None, 0, None),
    ("T12", d(8), "Налоговый отчёт благотворительной организации", "N6", "G5", None, None, None, None, d(-30), "обязательство", "L", "план", None, None, 0, None),
    ("T13", d(5), "Оплатить коммуналку", "N2", None, None, None, None, None, d(2), "обязательство", "S", "сделано", d(2), None, 0, None),
    ("T14", d(4), "Помочь организовать чужое мероприятие", "N2", None, None, None, None, None, d(1), "шаг", "L", "сделано", d(1), 3, 0, None),
    ("T15", d(3), "Письмо потенциальному клиенту", "N3", "G3", None, None, None, None, None, "шаг", "S", "сделано", d(2), None, 0, None),
    ("T16", d(12), "Стоматолог, чт 15:00", "N1", "G2", None, None, None, None, d(4), "запись", "M", "сделано", d(4), None, 0, None),
    ("T17", d(2), "Терапевт, анализы", "N1", "G2", None, None, None, None, d(-3), "запись", "M", "план", None, None, 0, None),
]
for i, t in enumerate(tasks, 2):
    vals = dict(zip([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 13, 14, 15, 17, 18, 21], t))
    for col, v in vals.items():
        D.cell(row=i, column=col, value=v)
for r in range(2, 152):
    for col in ("B", "J", "O"):
        D[f"{col}{r}"].number_format = "dd.mm.yyyy"
    D[f"L{r}"] = f'=IF(M{r}="S",1,IF(M{r}="M",2,IF(M{r}="L",4,"")))'
    D[f"P{r}"] = f'=IF(M{r}="","",IF(M{r}="S",0.25,IF(M{r}="M",1,4))+N(Q{r}))'
    D[f"P{r}"].number_format = '"≈"0.0'
    D[f"S{r}"] = (f'=IF(OR(F{r}="",K{r}="привычка",N{r}<>"сделано"),0,'
                  f'IFERROR(INDEX(Этапы!$J:$J,MATCH(F{r},Этапы!$A:$A,0))*L{r}/INDEX(Этапы!$G:$G,MATCH(F{r},Этапы!$A:$A,0)),0))')
    D[f"T{r}"] = (f'=IF(OR(H{r}="",K{r}="привычка",N{r}<>"сделано"),0,'
                  f'IFERROR(INDEX(Этапы!$J:$J,MATCH(H{r},Этапы!$A:$A,0))*L{r}/INDEX(Этапы!$G:$G,MATCH(H{r},Этапы!$A:$A,0)),0))')
    D[f"S{r}"].number_format = '+0.0%;-0.0%;-'; D[f"T{r}"].number_format = '+0.0%;-0.0%;-'
    D[f"V{r}"] = (f'=IF(OR(C{r}="",N{r}<>"сделано"),"",IF(K{r}="обязательство","4. обязательство",'
                  f'IF(OR(K{r}="привычка",I{r}<>""),"2. привычка",IF(S{r}+T{r}>0,"1. шаг цели",'
                  f'IF(E{r}<>"","3. результат? → «Деньги»","5. без вклада")))))')
D["S1"].comment = Comment("Вклад считается по текущему составу этапа: если в этап добавят дела, вклад старых дел честно уменьшится (ТЗ v3.2, п. «вклад задним числом»). Зафиксированный вклад в момент отметки сохраняйте в «Снимках».", "Claude")
D["P1"].comment = Comment("Оценка по размеру: S≈15 мин, M≈1 ч, L≈полдня (4 ч) + поправка «заняло больше». Время считается только по основной цели.", "Claude")
D["V1"].comment = Comment("Пять исходов дела из ТЗ. «Результат?» — подсказка: если дело дало деньги/решение, добавьте строку в «Деньги».", "Claude")
D["G1"].comment = Comment("До трёх доп. целей в продукте; в ручной версии — одна. Доп. связь ставите только вы.", "Claude")

# ---------------- Привычки ----------------
H = sheet("Привычки", ["ID", "Цель-состояние (ID)", "Привычка", "Норма", "Период", "Вес", "Активна", "Дней паузы за 28 дн.",
                       "Активных дней", "Ожидается за 28 дн.", "Выполнено за 28 дн.", "Выполнение нормы", "Вес × выполнение", "Учитываемый вес"],
          [7, 12, 30, 8, 13, 7, 9, 12, 11, 12, 12, 12, 12, 12], {1, 2, 3, 4, 5, 6, 7}, 39, first=False)
dv(H, "E2:E40", ["день", "неделя", "месяц"])
dv(H, "G2:G40", ["да", "нет"])
habits = [("H1", "G2", "Спорт", 3, "неделя", 1, "да"),
          ("H2", "G2", "Вода 2 л", 1, "день", 1, "да"),
          ("H3", "G2", "Массаж", 2, "месяц", 1, "да"),
          ("H5", "G2", "Добавки (витамин D)", 1, "день", 1, "да")]
for i, h in enumerate(habits, 2):
    for j, v in enumerate(h, 1):
        H.cell(row=i, column=j, value=v)
for r in range(2, 41):
    H[f"H{r}"] = f'=IF(A{r}="","",MIN(28,SUMIFS(Паузы!$F:$F,Паузы!$D:$D,"")+SUMIFS(Паузы!$F:$F,Паузы!$D:$D,A{r})))'
    H[f"I{r}"] = f'=IF(A{r}="","",28-H{r})'
    H[f"J{r}"] = f'=IF(A{r}="","",IF(E{r}="день",D{r}*I{r},IF(E{r}="неделя",D{r}*I{r}/7,IF(E{r}="месяц",D{r}*I{r}/30,0))))'
    H[f"J{r}"].number_format = "0.0"
    H[f"K{r}"] = f'=IF(A{r}="","",SUMIFS(Отметки!$C:$C,Отметки!$B:$B,A{r},Отметки!$A:$A,">="&(TODAY()-27),Отметки!$A:$A,"<="&TODAY())+COUNTIFS(Дела!$I:$I,A{r},Дела!$N:$N,"сделано",Дела!$O:$O,">="&(TODAY()-27)))'
    H[f"L{r}"] = f'=IF(OR(A{r}="",G{r}="нет"),"",IF(J{r}<1,"",MIN(1,K{r}/J{r})))'
    H[f"L{r}"].number_format = "0%"
    H[f"M{r}"] = f'=IF(L{r}="",0,F{r}*L{r})'
    H[f"N{r}"] = f'=IF(L{r}="",0,F{r})'
H["D1"].comment = Comment("Норма за период: 3 раза в неделю, 1 в день, 2 в месяц. Визиты к врачу — не привычка, а дела типа «запись» с основной целью-состоянием (лист «Дела»).", "Claude")
H["J1"].comment = Comment("Частота в день × активные дни окна (28 − дни паузы): неделя = /7, месяц = /30. Если ожидаемое < 1 — привычка в индекс не входит (ТЗ v3.2).", "Claude")

# ---------------- Отметки ----------------
C = sheet("Отметки", ["Дата", "Привычка (ID)", "Сколько раз", "Энергия 1–5 (вечер)", "Заметка"], [12, 13, 11, 16, 40], {1, 2, 3, 4, 5}, 300, first=False)
dv(C, "D2:D301", ["1", "2", "3", "4", "5"])
chk = [(d(1), "H2", 1, 4), (d(2), "H2", 1, 3), (d(3), "H1", 1, 4), (d(4), "H2", 1, None), (d(5), "H5", 1, 2),
       (d(8), "H1", 1, 4), (d(12), "H3", 1, None), (d(13), "H1", 1, 3), (d(1), "H5", 1, None)]
for i, c in enumerate(chk, 2):
    for j, v in enumerate(c, 1):
        C.cell(row=i, column=j, value=v)
for r in range(2, 302):
    C[f"A{r}"].number_format = "dd.mm.yyyy"

# ---------------- Паузы ----------------
P = sheet("Паузы", ["Начало", "Конец", "Причина", "Привычка (ID, пусто = все)", "Заметка", "Дней в окне 28 дн."], [12, 12, 20, 18, 30, 14], {1, 2, 3, 4, 5}, 30, first=False)
dv(P, "C2:C31", ["болею", "отпуск", "не зависит от меня"])
P["A2"] = d(18); P["B2"] = d(15); P["C2"] = "болею"
for r in range(2, 32):
    P[f"A{r}"].number_format = "dd.mm.yyyy"; P[f"B{r}"].number_format = "dd.mm.yyyy"
    P[f"F{r}"] = f'=IF(OR(A{r}="",B{r}=""),0,MAX(0,MIN(B{r},TODAY())-MAX(A{r},TODAY()-27)+1))'
P["F1"].comment = Comment("Пересекающиеся паузы считаются дважды — не вносите их внахлёст.", "Claude")

# ---------------- Деньги ----------------
Mo = sheet("Деньги", ["Дата", "Цель (ID)", "Описание", "Сумма", "Валюта", "Курс к базовой (на дату)", "Чьи деньги",
                      "≈ В базовой валюте", "Статус", "Доход/расход", "Дела, которые привели (ID)"],
           [12, 10, 34, 11, 8, 14, 12, 14, 13, 12, 22], {1, 2, 3, 4, 5, 6, 7, 9, 10, 11}, 100, first=False)
dv(Mo, "I2:I101", ["подтверждено", "ожидается", "гипотеза"])
dv(Mo, "J2:J101", ["доход", "расход"])
dv(Mo, "G2:G101", ["личные", "проекта"])
money = [(d(2), "G3", "Оплата от клиента", 1200, "EUR", 1, "личные", "подтверждено", "доход", "T15"),
         (d(1), "G4", "Грант одобрен", 8000, "EUR", 1, "проекта", "ожидается", "доход", "T9"),
         (d(1), "G3", "Возможный заказ на апрель", 50000, "UAH", 0.022, "личные", "гипотеза", "доход", "")]
for i, m in enumerate(money, 2):
    for col, v in zip([1, 2, 3, 4, 5, 6, 7, 9, 10, 11], m):
        Mo.cell(row=i, column=col, value=v)
for r in range(2, 102):
    Mo[f"A{r}"].number_format = "dd.mm.yyyy"
    Mo[f"D{r}"].number_format = "#,##0"
    Mo[f"H{r}"] = f'=IF(D{r}="","",D{r}*IF(F{r}="",1,F{r}))'
    Mo[f"H{r}"].number_format = '"≈"#,##0'
Mo["F1"].comment = Comment("Курс на дату записи вводите сами (например, по ЕЦБ). Для базовой валюты — 1.", "Claude")

# ---------------- Снимки ----------------
S = sheet("Снимки", ["Дата", "ВНЖ (G1)", "Грант (G4)", "Нужный темп ВНЖ", "Регулярность (G2)", "Энергия, ср. за 7 дн. /5"], [12, 12, 12, 14, 15, 16], {1, 2, 3, 4, 5, 6}, 60, first=False)
S["H1"] = "Строка «сегодня» — скопируйте её значения в таблицу слева раз в неделю:"; S["H1"].font = BOLD
heads = ["Дата", "ВНЖ (G1)", "Грант (G4)", "Нужный темп ВНЖ", "Регулярность (G2)", "Энергия"]
for j, h in enumerate(heads):
    c = S.cell(row=2, column=8 + j, value=h); c.font = HDR; c.fill = HFILL
today_f = ["=TODAY()", "=Цели!I2", "=Цели!I5", "=Цели!J2", "=Цели!M3",
           '=IFERROR(AVERAGEIFS(Отметки!D:D,Отметки!A:A,">="&(TODAY()-6))/5,"")']
for j, f in enumerate(today_f):
    c = S.cell(row=3, column=8 + j, value=f); c.fill = CALCFILL; c.font = BLACK
    c.number_format = "dd.mm.yyyy" if j == 0 else "0%"
for col in "HIJKLM":
    S.column_dimensions[col].width = 14
snaps = [(d(28), 0.0, 0.0, 0.0, 0.55, 0.6), (d(21), 0.10, 0.0, 0.025, 0.5, 0.5), (d(14), 0.10, 0.0, 0.05, 0.62, 0.7), (d(7), 0.13, 0.0, 0.075, 0.7, 0.7)]
for i, s in enumerate(snaps, 2):
    for j, v in enumerate(s, 1):
        S.cell(row=i, column=j, value=v)
for r in range(2, 62):
    S[f"A{r}"].number_format = "dd.mm.yyyy"
    for col in "BCDEF":
        S[f"{col}{r}"].number_format = "0%"
ch = LineChart(); ch.title = "Линии целей: план выполнен vs нужный темп"; ch.height = 8; ch.width = 18
ch.add_data(Reference(S, min_col=2, max_col=4, min_row=1, max_row=30), titles_from_data=True)
ch.set_categories(Reference(S, min_col=1, min_row=2, max_row=30))
ch.y_axis.number_format = "0%"; ch.y_axis.scaling.min = 0
ch.roundedCorners = False; ch.legend.overlay = False; ch.title.overlay = False
ch.x_axis.delete = False; ch.y_axis.delete = False; ch.x_axis.number_format = "dd.mm"
S.add_chart(ch, "H6")
ch2 = LineChart(); ch2.title = "Здоровье: регулярность и энергия"; ch2.height = 8; ch2.width = 18
ch2.add_data(Reference(S, min_col=5, max_col=6, min_row=1, max_row=30), titles_from_data=True)
ch2.set_categories(Reference(S, min_col=1, min_row=2, max_row=30))
ch2.y_axis.number_format = "0%"; ch2.y_axis.scaling.min = 0; ch2.y_axis.scaling.max = 1
ch2.roundedCorners = False; ch2.legend.overlay = False; ch2.title.overlay = False
ch2.x_axis.delete = False; ch2.y_axis.delete = False; ch2.x_axis.number_format = "dd.mm"
S.add_chart(ch2, "H23")

# ---------------- Обзор недели ----------------
O = wb.create_sheet("Обзор недели")
O.column_dimensions["A"].width = 34
for col in "BCDEFG":
    O.column_dimensions[col].width = 16
O["A1"] = "Недельный обзор"; O["A1"].font = TITLE
O["A2"] = '="Неделя "&TEXT(TODAY()-6,"dd.mm")&" – "&TEXT(TODAY(),"dd.mm.yyyy")'
O["A4"] = "1. Что сдвинулось (сначала хорошее)"; O["A4"].font = BOLD
hdr = ["Цель", "Тип", "План выполнен на", "Нужный темп", "Дней без шага", "Регулярность", "Факт ≈"]
for j, h in enumerate(hdr):
    c = O.cell(row=5, column=1 + j, value=h); c.font = HDR; c.fill = HFILL
for k in range(10):
    r = 6 + k; g = 2 + k
    srcs = [f'=IF(Цели!C{g}="","",Цели!C{g})', f'=IF(Цели!D{g}="","",Цели!D{g})', f'=IF(Цели!I{g}="","",Цели!I{g})',
            f'=IF(Цели!J{g}="","",Цели!J{g})', f'=IF(Цели!L{g}="","",Цели!L{g})', f'=IF(Цели!M{g}="","",Цели!M{g})', f'=IF(Цели!N{g}="","",Цели!N{g})']
    for j, f in enumerate(srcs):
        c = O.cell(row=r, column=1 + j, value=f); c.font = BLACK; c.border = BOX
        c.number_format = ["@", "@", "0%", "0%", "0", "0%", '"≈"#,##0;"≈-"#,##0;-'][j]
O["A17"] = "2. Куда ушли силы (≈ часы и вклад по направлениям)"; O["A17"].font = BOLD
for j, h in enumerate(["Направление", "≈ часов", "Вклад в цели-проекты", "≈ часов без вклада"]):
    c = O.cell(row=18, column=1 + j, value=h); c.font = HDR; c.fill = HFILL
for k in range(8):
    r = 19 + k; a = 2 + k
    for j, col in enumerate("BCDE"):
        c = O.cell(row=r, column=1 + j, value=f'=IF(Направления!{col}{a}="","",Направления!{col}{a})')
        c.font = BLACK; c.border = BOX
        c.number_format = ["@", '"≈"0.0', "0.0%", '"≈"0.0'][j]
bc = BarChart(); bc.type = "bar"; bc.title = "Часы за неделю по направлениям"; bc.height = 8; bc.width = 16
bc.add_data(Reference(O, min_col=2, max_col=2, min_row=18, max_row=24), titles_from_data=True)
bc.add_data(Reference(O, min_col=4, max_col=4, min_row=18, max_row=24), titles_from_data=True)
bc.set_categories(Reference(O, min_col=1, min_row=19, max_row=24))
bc.roundedCorners = False; bc.legend.overlay = False; bc.title.overlay = False
bc.x_axis.delete = False; bc.y_axis.delete = False
O.add_chart(bc, "F17")
O["A28"] = "Вклад показан только для целей-проектов: % плана и пункты регулярности несравнимы (ТЗ v3.2)."
O["A28"].font = Font(name=F, italic=True, color="666666")
O["A30"] = "3. Кандидаты в сигналы (Claude выберет до трёх)"; O["A30"].font = BOLD
sig = [("Дел перенесено 3+ раза", '=COUNTIFS(Дела!R:R,">=3",Дела!N:N,"план")'),
       ("Дел «жду от других»", '=COUNTIFS(Дела!N:N,"жду")'),
       ("≈ часов без вклада за неделю", '=SUM(Направления!E2:E9)'),
       ("Этапов без причины закрытия", '=COUNTIF(Этапы!L:L,"⚠*")'),
       ("Просроченных обязательств", '=COUNTIFS(Дела!K:K,"обязательство",Дела!N:N,"план",Дела!J:J,"<"&TODAY())'),
       ("Целей-состояний с регулярностью < 50% (кандидат в главные, если 2 недели подряд)", '=COUNTIFS(Цели!D:D,"состояние",Цели!M:M,"<0.5")'),
       ("Обязательств со сроком ≤ 30 дней", '=COUNTIFS(Дела!K:K,"обязательство",Дела!N:N,"план",Дела!J:J,">="&TODAY(),Дела!J:J,"<="&(TODAY()+30))')]
for k, (a, f) in enumerate(sig):
    O.cell(row=31 + k, column=1, value=a).font = BLACK
    c = O.cell(row=31 + k, column=2, value=f); c.font = BLACK; c.fill = CALCFILL
O["B33"].number_format = '"≈"0.0'
O["A39"] = "4. Деньги за всё время по целям (подтверждено и ожидается — раздельно, не складываются)"; O["A39"].font = BOLD
for j, h in enumerate(["Цель", "Подтверждено ≈", "Ожидается ≈"]):
    c = O.cell(row=40, column=1 + j, value=h); c.font = HDR; c.fill = HFILL
for k in range(10):
    g = 2 + k
    for j, f in enumerate([f'=IF(Цели!C{g}="","",Цели!C{g})', f'=IF(Цели!C{g}="","",Цели!N{g})', f'=IF(Цели!C{g}="","",Цели!O{g})']):
        c = O.cell(row=41 + k, column=1 + j, value=f); c.font = BLACK; c.border = BOX
        if j: c.number_format = '"≈"#,##0;"≈-"#,##0;-'

# ---------------- Интервью ----------------
I = sheet("Интервью", ["№", "Дата", "Сегмент", "Имя / ник", "Канал", "Недавний случай: цель стояла из-за текучки?", "Пропустил срок / потерял доход?",
                       "Боль подтверждена", "Чем пользовался и почему бросил", "Что смутило бы в ИИ", "Готов тестировать?", "Готов предоплатить?", "Цитата"],
          [5, 11, 9, 16, 12, 22, 20, 11, 26, 24, 11, 11, 34], set(range(1, 14)) - {8}, 25, first=False)
dv(I, "C2:C26", ["А", "Б"])
dv(I, "F2:F26", ["да", "нет"]); dv(I, "G2:G26", ["да", "нет"]); dv(I, "K2:K26", ["да", "нет"]); dv(I, "L2:L26", ["да", "нет"])
for r in range(2, 27):
    I[f"A{r}"] = r - 1
    I[f"B{r}"].number_format = "dd.mm.yyyy"
    I[f"H{r}"] = f'=IF(C{r}="","",IF(OR(F{r}="да",G{r}="да"),"да","нет"))'
I["O1"] = "Итог по сегментам"; I["O1"].font = BOLD
for j, h in enumerate(["Сегмент", "Интервью", "Боль, доля", "Критерий ≥ 60%", "Тестировщиков"]):
    c = I.cell(row=2, column=15 + j, value=h); c.font = HDR; c.fill = HFILL
for k, seg in enumerate(["А", "Б"]):
    r = 3 + k
    I.cell(row=r, column=15, value=seg)
    I.cell(row=r, column=16, value=f'=COUNTIF($C$2:$C$26,O{r})')
    c = I.cell(row=r, column=17, value=f'=IF(P{r}=0,"",COUNTIFS($C$2:$C$26,O{r},$H$2:$H$26,"да")/P{r})'); c.number_format = "0%"
    I.cell(row=r, column=18, value=f'=IF(P{r}<8,"нужно ≥ 8 интервью",IF(Q{r}>=0.6,"✔ выполнен","✘ не выполнен"))')
    I.cell(row=r, column=19, value=f'=COUNTIFS($C$2:$C$26,O{r},$K$2:$K$26,"да")')
I.cell(row=5, column=15, value="Всего тестировщиков (цель 15+)")
I.cell(row=5, column=19, value="=S3+S4")
for col in "OPQRS":
    I.column_dimensions[col].width = 16
I.column_dimensions["O"].width = 30

wb.save(OUT)
print("saved", OUT)
