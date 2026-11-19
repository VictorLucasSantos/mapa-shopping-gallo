"""Gera lojas-data.js (dados embutidos no app) e seed.sql (carga/atualização das lojas no Supabase).

Fonte: lojas.json (gerado por atualizar_lojas.py) se existir; senão lojas.txt.
    python build.py
"""
import datetime
import json
import pathlib

here = pathlib.Path(__file__).parent


def carregar():
    js = here / "lojas.json"
    if js.exists():
        d = json.loads(js.read_text(encoding="utf-8"))
        return [(x["n"], x["s"], x.get("c", []), x["l"]) for x in d["lojas"]], d.get("data", "")
    out = []
    for l in (here / "lojas.txt").read_text(encoding="utf-8").splitlines():
        if l.strip():
            n, s, c, loc = l.split("|")
            out.append((n, s, [x for x in c.split(",") if x], loc))
    return out, datetime.date.today().strftime("%d/%m/%Y")


def q(s: str) -> str:
    return "'" + s.replace("'", "''") + "'"


def main():
    lojas, data = carregar()
    vistos, unicas = set(), []
    for l in lojas:  # slug é a chave: descarta repetidos
        if l[1] not in vistos:
            vistos.add(l[1])
            unicas.append(l)
    linhas = [f"{n}|{s}|{','.join(c)}|{loc}" for n, s, c, loc in unicas]
    (here / "lojas-data.js").write_text(
        f"window.MM_DATE={json.dumps(data)};\nwindow.MM_RAW={json.dumps(linhas, ensure_ascii=False)};\n", encoding="utf-8")
    vals = ",\n".join(
        f"({q(s)},{q(n)},array[{','.join(q(x) for x in c)}]::text[],{q(loc)})" for n, s, c, loc in unicas)
    (here / "seed.sql").write_text(
        "-- Carga das lojas (rode no SQL Editor do Supabase depois do supabase.sql).\n"
        "-- Pode rodar de novo a qualquer momento: atualiza nome/segmentos/endereço e preserva o que os lojistas editaram.\n"
        "insert into public.lojas (slug, nome, categorias, localizacao) values\n" + vals +
        "\non conflict (slug) do update set nome = excluded.nome, categorias = excluded.categorias, localizacao = excluded.localizacao;\n",
        encoding="utf-8")
    print(len(unicas), "lojas -> lojas-data.js, seed.sql")


if __name__ == "__main__":
    main()
