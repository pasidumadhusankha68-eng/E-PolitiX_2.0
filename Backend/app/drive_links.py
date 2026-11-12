from urllib.parse import urlparse, parse_qs


def _valid_id(file_id: str) -> bool:
    if len(file_id) < 10:
        return False
    for ch in file_id:
        if not (ch.isalnum() or ch == "-" or ch == "_"):
            return False
    return True


def to_embed_url(url: str) -> str | None:
    parsed = urlparse(url)
    if parsed.scheme != "https":
        return None
    if parsed.netloc not in ("drive.google.com", "docs.google.com"):
        return None

    parts = [p for p in parsed.path.split("/") if p]
    host = parsed.netloc

    if host == "drive.google.com":
        if len(parts) >= 4 and parts[0] == "file" and parts[1] == "d":
            file_id = parts[2]
            if not _valid_id(file_id):
                return None
            if parts[3] not in ("view", "edit", "preview"):
                return None
            return "https://drive.google.com/file/d/" + file_id + "/preview"

        if len(parts) >= 1 and parts[0] in ("open", "uc"):
            query = parse_qs(parsed.query)
            file_ids = query.get("id")
            if not file_ids:
                return None
            file_id = file_ids[0]
            if not _valid_id(file_id):
                return None
            return "https://drive.google.com/file/d/" + file_id + "/preview"

        return None

    if host == "docs.google.com":
        if (
            len(parts) >= 3
            and parts[1] == "d"
            and parts[0] in ("document", "spreadsheets", "presentation")
        ):
            file_id = parts[2]
            if not _valid_id(file_id):
                return None
            if parts[0] == "document":
                return "https://docs.google.com/document/d/" + file_id + "/preview"
            if parts[0] == "spreadsheets":
                return "https://docs.google.com/spreadsheets/d/" + file_id + "/preview"
            return "https://docs.google.com/presentation/d/" + file_id + "/embed"
        return None

    return None


if __name__ == "__main__":
    examples = [
        "https://drive.google.com/file/d/abcdefghij1234/view",
        "https://drive.google.com/file/d/abcdefghij1234/edit?usp=sharing",
        "https://drive.google.com/open?id=abcdefghij1234",
        "https://drive.google.com/uc?id=abcdefghij1234",
        "https://docs.google.com/document/d/abcdefghij1234/edit",
        "https://docs.google.com/spreadsheets/d/abcdefghij1234/edit#gid=0",
        "https://docs.google.com/presentation/d/abcdefghij1234/edit",
    ]
    for url in examples:
        print(url, "->", to_embed_url(url))
