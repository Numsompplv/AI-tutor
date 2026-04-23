/* ── Sample Notebooks ── */
export const initNB = [
  { id: "1", name: "Database Systems", desc: "SQL, normalization, ER diagrams", docs: 4, convos: 7, color: "#3b82f6" },
  { id: "2", name: "Machine Learning", desc: "Neural networks, deep learning", docs: 6, convos: 12, color: "#8b5cf6" },
  { id: "3", name: "Calculus II", desc: "Integrals, series, multivariable", docs: 3, convos: 5, color: "#10b981" },
  { id: "4", name: "Philosophy of Mind", desc: "Consciousness and AI", docs: 0, convos: 3, color: "#f59e0b" },
];

/* ── Sample Conversations ── */
export const sConvos = [
  { id: "c1", title: "Normalization & Normal Forms", last: "Quiz me on 3NF?", time: "2m" },
  { id: "c2", title: "SQL Joins Explained", last: "Thanks!", time: "1h" },
  { id: "c3", title: "ER Diagrams", last: "M:N relations?", time: "1d" },
];

/* ── Sample Documents ── */
export const sDocs = [
  { id: "d1", name: "DB_Lecture_03.pdf", type: "pdf", size: "2.4MB", chunks: 47 },
  { id: "d2", name: "DB_Textbook.pdf", type: "pdf", size: "5.1MB", chunks: 112 },
  { id: "d3", name: "SQL_Notes.pdf", type: "pdf", size: "890KB", chunks: 23 },
  { id: "d4", name: "ER_Diagrams.pptx", type: "pptx", size: "3.7MB", chunks: 31 },
];

/* ── Sample Chat Messages ── */
export const sMsgs = [
  { id: "m1", role: "user", content: "Explain database normalization", time: "10:23" },
  {
    id: "m2", role: "assistant", time: "10:23",
    content: "Database normalization organizes tables to minimize redundancy and improve integrity.\n\nIt breaks large tables into smaller ones with proper relationships between them.",
    cites: [
      { doc: "DB_Lecture_03.pdf", pg: 14, txt: "Normalization decomposes tables to eliminate redundancy..." },
      { doc: "DB_Lecture_03.pdf", pg: 15, txt: "Goal: eliminate redundant data and ensure dependencies make sense..." },
    ],
  },
  { id: "m3", role: "user", content: "What are the main normal forms?", time: "10:24" },
  {
    id: "m4", role: "assistant", time: "10:25",
    content: "**1NF** — Atomic values, unique rows, no repeating groups.\n\n**2NF** — Meets 1NF, eliminates partial dependencies.\n\n**3NF** — Meets 2NF, eliminates transitive dependencies.\n\n**BCNF** — Stricter version where every determinant is a candidate key.",
    cites: [
      { doc: "DB_Lecture_03.pdf", pg: 16, txt: "1NF requires atomic values..." },
      { doc: "DB_Lecture_03.pdf", pg: 18, txt: "3NF eliminates transitive deps..." },
    ],
  },
];

/* ── Built-in Quiz Questions ── */
export const qBank = [
  { q: "Which NF eliminates transitive dependencies?", o: ["1NF", "2NF", "3NF", "BCNF"], a: 2, why: "3NF specifically targets transitive dependencies — where a non-key attribute depends on another non-key attribute." },
  { q: "What does ACID stand for?", o: ["Atomicity Consistency Isolation Durability", "Add Create Insert Delete", "Atomicity Concurrency Isolation Data", "None of the above"], a: 0, why: "ACID stands for Atomicity, Consistency, Isolation, and Durability — four properties guaranteeing reliable transactions." },
  { q: "Which SQL clause filters grouped results?", o: ["WHERE", "HAVING", "GROUP BY", "ORDER BY"], a: 1, why: "HAVING filters after GROUP BY. WHERE filters individual rows before grouping." },
  { q: "What is a foreign key?", o: ["Encrypted key", "PK referenced from another table", "Key that can't be null", "Auto-increment key"], a: 1, why: "A foreign key references the primary key of another table, establishing a relationship." },
  { q: "Which join returns all rows from both tables?", o: ["INNER", "LEFT", "RIGHT", "FULL OUTER"], a: 3, why: "FULL OUTER JOIN returns all rows from both tables, filling NULLs where there's no match." },
  { q: "1NF requires?", o: ["No partial deps", "Atomic values only", "No transitive deps", "All candidate keys"], a: 1, why: "1NF requires each column contains only atomic (indivisible) values." },
  { q: "What is a composite key?", o: ["Single column key", "PK+FK combo", "Key of 2+ columns", "Auto-increment"], a: 2, why: "A composite key is a primary key made up of two or more columns together." },
  { q: "Which command removes a table entirely?", o: ["DELETE", "REMOVE", "DROP", "TRUNCATE"], a: 2, why: "DROP TABLE removes the entire table structure and data." },
  { q: "SQL stands for?", o: ["Structured Query Language", "Simple Question Language", "Standard Query Logic", "System Query Language"], a: 0, why: "SQL = Structured Query Language — the standard for relational databases." },
  { q: "What is denormalization?", o: ["Remove all tables", "Add redundancy for read performance", "Convert to 1NF", "Delete duplicates"], a: 1, why: "Denormalization adds redundancy back to improve read performance." },
  { q: "4NF handles?", o: ["Partial deps", "Transitive deps", "Multi-valued deps", "Join deps"], a: 2, why: "4NF addresses multi-valued dependencies." },
  { q: "Candidate key is?", o: ["Key for deletion", "Minimal superkey", "The PK", "A FK"], a: 1, why: "A candidate key is a minimal superkey — the smallest set of columns that uniquely identifies rows." },
  { q: "Referential integrity ensures?", o: ["Tables have PKs", "FKs reference valid rows", "No null columns", "Types match"], a: 1, why: "Referential integrity ensures every FK points to an existing row." },
  { q: "JOIN does what?", o: ["Merges schemas", "Combines table rows", "Deletes duplicates", "Sorts results"], a: 1, why: "JOIN combines rows from two or more tables based on related columns." },
  { q: "A SQL view is?", o: ["Physical copy", "Virtual table from query", "Backup", "Index"], a: 1, why: "A view is a virtual table defined by a saved SELECT query." },
  { q: "GROUP BY does?", o: ["Sorts", "Filters", "Groups rows by property", "Limits output"], a: 2, why: "GROUP BY groups rows sharing a common value for aggregate functions." },
  { q: "An index is for?", o: ["Security", "Faster retrieval", "Backup", "Schema design"], a: 1, why: "An index speeds up data retrieval with a sorted lookup structure." },
  { q: "Most common relationship type?", o: ["1:1", "1:N", "M:N", "None"], a: 1, why: "One-to-many (1:N) is the most common — e.g. one customer, many orders." },
  { q: "A transaction is?", o: ["Single query", "Atomic unit of work", "Table operation", "Database backup"], a: 1, why: "A transaction is an atomic unit of work — all succeed or all rollback." },
  { q: "CASCADE on DELETE?", o: ["Prevents deletion", "Auto-deletes related rows", "Logs the deletion", "Sets values to null"], a: 1, why: "CASCADE DELETE auto-removes related child rows when the parent is deleted." },
];
