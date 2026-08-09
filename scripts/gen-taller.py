# -*- coding: utf-8 -*-
import json
from docx import Document

DOCX = '/Users/manuelrueda/Library/CloudStorage/OneDrive-Personal/MANEL AUTOR/IKIGAI/MANUSCRITOS/CASTELLANO/Camina_sin_separarte_de_ti_definitivo.docx'
d = Document(DOCX)
def p(i): return d.paragraphs[i].text.strip()
def R(*idx): return {"kind":"reading","paras":[p(i) for i in idx]}
def Q(id, prompt_i, hint_i=None, label=None):
    b={"kind":"question","id":id,"prompt":p(prompt_i)}
    if hint_i is not None: b["hint"]=p(hint_i)
    if label: b["label"]=label
    return b
def SC(id, stmt_i): return {"kind":"scale","id":id,"statement":p(stmt_i)}
def FW(id, title=None, prompt=None):
    b={"kind":"freewrite","id":id}
    if title: b["title"]=title
    if prompt: b["prompt"]=prompt
    return b
def EX(label,title): return {"kind":"exercise","label":label,"title":title}
def QUOTE(*idx): return {"kind":"quote","lines":[p(i) for i in idx]}
def NOTE(text_i,title_i): return {"kind":"tallernote","title":p(title_i),"text":p(text_i)}

sections=[]

# INTRO
sections.append({"id":"intro","label":"","title":"Antes de empezar","blocks":[
 R(22,23,24,25),
 QUOTE(30,31),
 {"kind":"exercise","label":"","title":p(35)},
 R(36),
 R(39,40,41,42),
 {"kind":"exercise","label":"","title":p(45)},
 R(46,47,48,49,50,52),
 {"kind":"exercise","label":"","title":p(58)},
 R(59,61,62,63,64,65,67),
]})

# SECCIÓN UNO
sections.append({"id":"s1","label":p(70),"title":p(71),"blocks":[
 R(73,74,75),
 QUOTE(78,79),
 {"kind":"exercise","label":"","title":p(83)},
 R(84),
 Q("s1_energia",85),
 Q("s1_esperas",93),
 Q("s1_temes",101),
 {"kind":"exercise","label":"","title":p(111)},
 R(112),
 FW("s1_espacio"),
]})

# SECCIÓN DOS
sections.append({"id":"s2","label":p(131),"title":p(132),"blocks":[
 R(134,135,136,137,138),
 Q("s2_ikigais",140),
 {"kind":"exercise","label":"","title":p(155)},
 R(158,159,161,162),
 QUOTE(165,166),
 {"kind":"exercise","label":"","title":p(170)},
 R(171,172),
 QUOTE(175,176,177),
 {"kind":"exercise","label":"","title":p(181)},
 R(182,183,184),
 Q("s2_donde_debo",185),
 Q("s2_comun",191),
 Q("s2_aleja",197),
 {"kind":"exercise","label":"","title":p(205)},
 R(206,207,208),
 QUOTE(211,212),
 {"kind":"exercise","label":"","title":p(216)},
 R(217),
 Q("s2_pa_areas",218),
 Q("s2_pa_momento",226),
 Q("s2_pa_mando",234),
 EX(p(244),p(245)),
 R(247,248),
 Q("e1_q1",251,252,p(250)),
 Q("e1_q2",270,271,p(269)),
 Q("e1_q3",289,290,p(288)),
 Q("e1_q4",308,309,p(307)),
 NOTE(328,327),
 {"kind":"exercise","label":"","title":p(331)},
 R(332,333),
 Q("e1_patron",334),
 Q("e1_removido",341),
 Q("e1_emocion",348),
 R(356),
]})

# SECCIÓN TRES
sections.append({"id":"s3","label":p(359),"title":p(360),"blocks":[
 R(362,363,365),
 {"kind":"exercise","label":"","title":p(368)},
 R(369,370),
 R(371,372,373,374,375,376,377),
 R(378),
 QUOTE(381,382,383),
 {"kind":"exercise","label":"","title":p(387)},
 R(388,389,390),
 R(391,392,393,394,395,396,397),
 Q("s3_miedo",399),
 {"kind":"exercise","label":"","title":p(409)},
 R(410,411,412,413),
 QUOTE(416,417,418),
 EX(p(422),p(423)),
 R(425,426),
 Q("e2_q1",429,430,p(428)),
 Q("e2_q2",448,449,p(447)),
 Q("e2_q3",467,468,p(466)),
 Q("e2_q4",486,487,p(485)),
 QUOTE(505,506,507),
 R(509),
 FW("e2_espacio"),
 {"kind":"exercise","label":"","title":p(523)},
 R(524,525),
 SC("e2_sc1",526),
 SC("e2_sc2",528),
 SC("e2_sc3",530),
 SC("e2_sc4",532),
 SC("e2_sc5",534),
 SC("e2_sc6",536),
 SC("e2_sc7",538),
 R(541),
 Q("e2_top3",542),
 R(548),
 NOTE(552,551),
]})

# SECCIÓN CUATRO
sections.append({"id":"s4","label":p(555),"title":p(556),"blocks":[
 R(558,559,560),
 {"kind":"exercise","label":"","title":p(563)},
 R(564,566,567),
 QUOTE(570,571,572),
 EX(p(576),p(577)),
 R(579,580),
 Q("e3_cuerpo",581,582),
 Q("e3_sensacion",589,590),
 Q("e3_emocion",597,598),
 Q("e3_cuanto",605),
 NOTE(614,613),
 {"kind":"exercise","label":"","title":p(617)},
 R(619,620),
 FW("s4_diario1",title=p(623)),
 FW("s4_diario2",title=p(646)),
 FW("s4_diario3",title=p(669)),
 FW("s4_diario4",title=p(692)),
 EX(p(715),p(716)),
 R(718,719),
 {"kind":"exercise","label":"","title":p(721)},
 R(722),
 Q("h_brillas",723),
 {"kind":"exercise","label":"","title":p(734)},
 R(735),
 Q("h_mueves",736),
 R(747),
 {"kind":"exercise","label":"","title":p(750)},
 R(751,752,753),
 Q("d_pasion",754,755),
 Q("d_talento",761,762),
 Q("d_mundo",768,769),
 Q("d_pagar",775,776),
 R(784,785,786,787,788,789),
 Q("d_activo",791),
]})

# SECCIÓN CINCO
sections.append({"id":"s5","label":p(800),"title":p(801),"blocks":[
 R(803,804,805),
 {"kind":"exercise","label":"","title":p(808)},
 R(809,810),
 Q("s5_activo",811),
 Q("s5_consciente",818),
 Q("s5_reforzar",826),
 Q("s5_juntos",833,834),
 R(842),
 {"kind":"exercise","label":"","title":p(845)},
 R(846,847),
 Q("s5_palabra",849),
 Q("s5_palabra_por",852),
 R(860),
 {"kind":"exercise","label":"","title":p(863)},
 R(864,865),
 Q("s5_paso",866),
 {"kind":"exercise","label":"","title":p(873)},
 Q("s5_paso_necesito",874),
 Q("s5_paso_impide",880),
 Q("s5_paso_quien",886,887),
 Q("s5_paso_cuando",892,893),
 R(899),
 {"kind":"exercise","label":"","title":p(902)},
 R(903,904,905),
 FW("s5_traicion"),
 QUOTE(923,924),
 {"kind":"exercise","label":"","title":p(928)},
 R(929,930),
 FW("s5_carta",prompt=p(932)),
 {"kind":"exercise","label":"","title":p(943)},
 R(944,945),
 Q("s5_compromiso",947),
 R(959,960,962),
 {"kind":"exercise","label":"","title":p(965)},
 R(966,967),
 Q("s5_cierre_entrada",968),
 Q("s5_cierre_cambiado",975),
 Q("s5_cierre_llevas",982),
 R(990),
 QUOTE(1014,1015,1017),
]})

# answerable ids
ids=[]
for s in sections:
    for b in s["blocks"]:
        if b["kind"] in ("question","scale","freewrite"):
            ids.append(b["id"])
assert len(ids)==len(set(ids)), "duplicate ids!"

header = """// AUTO-GENERADO desde el cuaderno \"Camina sin separarte de ti\". No editar a mano.
// Regenerar con scripts/gen-taller.py si cambia el cuaderno.

export type Block =
  | { kind: 'reading'; paras: string[] }
  | { kind: 'quote'; lines: string[] }
  | { kind: 'exercise'; label: string; title: string }
  | { kind: 'question'; id: string; prompt: string; hint?: string; label?: string }
  | { kind: 'scale'; id: string; statement: string }
  | { kind: 'freewrite'; id: string; title?: string; prompt?: string }
  | { kind: 'tallernote'; title: string; text: string }

export interface Section {
  id: string
  label: string
  title: string
  blocks: Block[]
}

export const TALLER_CONTENT: Section[] = """

out = header + json.dumps(sections, ensure_ascii=False, indent=2) + "\n\nexport const ANSWERABLE_IDS: string[] = " + json.dumps(ids, ensure_ascii=False) + "\n"

with open('/Users/manuelrueda/ikicard-app/lib/taller-content.ts','w') as f:
    f.write(out)

print("OK sections:",len(sections),"answerable:",len(ids))
