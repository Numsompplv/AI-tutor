from app.rag import retrieve_chunks, ask_ollama, rag_answer, free_learning_answer


def run_explanation_crew(question: str, notebook_id: str = None) -> dict:
    """Explainer agent — grounded in documents if available."""
    if notebook_id:
        # Retrieve relevant chunks
        chunks = retrieve_chunks(notebook_id, question, top_k=3)
        if chunks:
            context = "\n\n".join([
                f"[Source: {c['doc']}, Page {c['page']}]\n{c['text']}"
                for c in chunks
            ])
            prompt = f"""You are a friendly AI tutor. Answer the student's question 
            based ONLY on the course materials below.
Be clear, educational, and encouraging. Use examples where helpful.

Course Materials:
{context}

Student Question: {question}

Answer:"""
            answer = ask_ollama(prompt)
            citations = [
                {"doc": c["doc"], "page": c["page"], "text": c["text"][:150] + "..." if len(c["text"]) > 150 else c["text"]}
                for c in chunks
            ]
            return {"answer": answer, "citations": citations, "mode": "rag"}
        else:
            # No chunks found — use general knowledge
            prompt = f"""You are a friendly AI tutor. The student uploaded documents but no relevant content was found for this question.
Answer using your general knowledge and mention that you couldn't find this in their materials.

Question: {question}

Answer:"""
            return {"answer": ask_ollama(prompt), "citations": [], "mode": "general"}
    else:
        # Free learning mode
        prompt = f"""You are a friendly AI tutor. Explain the following clearly and helpfully.
Use examples and be encouraging.

Question: {question}

Answer:"""
        return {"answer": ask_ollama(prompt), "citations": [], "mode": "general"}


def run_quiz_crew(topic: str, notebook_id: str = None) -> dict:
    """Quiz agent — generates questions from documents or general knowledge."""
    if notebook_id:
        chunks = retrieve_chunks(notebook_id, topic, top_k=5)
        if chunks:
            context = "\n\n".join([c["text"] for c in chunks[:5]])
            prompt = f"""You are a quiz generator. Based on the course material below,
              generate 3 multiple choice questions.

Course Material:
{context}

Format each question EXACTLY like this:
Q1: [question]
A) [option]
B) [option]
C) [option]
D) [option]
Answer: [letter]
Explanation: [why]

Q2: ...
Q3: ..."""
        else:
            prompt = f"""Generate 3 multiple choice questions about: {topic}

Format each question EXACTLY like this:
Q1: [question]
A) [option]
B) [option]
C) [option]
D) [option]
Answer: [letter]
Explanation: [why]

Q2: ...
Q3: ..."""
    else:
        prompt = f"""Generate 3 multiple choice questions about: {topic}

Format each question EXACTLY like this:
Q1: [question]
A) [option]
B) [option]
C) [option]
D) [option]
Answer: [letter]
Explanation: [why]

Q2: ...
Q3: ..."""

    answer = ask_ollama(prompt)
    return {"answer": answer, "citations": [], "mode": "quiz"}


def run_feedback_crew(question: str, student_answer: str, correct_answer: str = None) -> dict:
    """Feedback agent — evaluates student answer."""
    prompt = f"""You are a supportive AI tutor evaluating a student's answer.

Question: {question}
Student's Answer: {student_answer}
{"Correct Answer: " + correct_answer if correct_answer else ""}

Provide:
1. Is the answer correct, partially correct, or incorrect?
2. What did they get right?
3. What did they miss or misunderstand?
4. A clear explanation of the correct concept.

Be encouraging and constructive."""

    answer = ask_ollama(prompt)
    return {"answer": answer, "citations": [], "mode": "feedback"}


def parse_quiz_questions(raw_text: str) -> list:
    """Parse LLM-generated quiz questions into structured format."""
    questions = []
    lines = raw_text.strip().split("\n")
    current = {}
    options = []

    for line in lines:
        line = line.strip()
        if not line:
            continue

        if line.startswith("Q") and ":" in line and len(line.split(":")[0]) <= 3:
            if current and options:
                current["o"] = options
                questions.append(current)
            current = {"q": line.split(":", 1)[1].strip(), "why": ""}
            options = []

        elif line.startswith(("A)", "B)", "C)", "D)")):
            options.append(line[2:].strip())

        elif line.startswith("Answer:"):
            ans_letter = line.replace("Answer:", "").strip().upper()
            ans_map = {"A": 0, "B": 1, "C": 2, "D": 3}
            current["a"] = ans_map.get(ans_letter[0], 0)

        elif line.startswith("Explanation:"):
            current["why"] = line.replace("Explanation:", "").strip()

    if current and options:
        current["o"] = options
        questions.append(current)

    return questions