from pathlib import Path
import json
import pandas as pd

# ============================================================
# PROJECT PATHS
# ============================================================

PROJECT_ROOT = Path(__file__).resolve().parents[1]

RAW_DATA_DIR = PROJECT_ROOT / "raw-data"
CLEAN_DATA_DIR = PROJECT_ROOT / "src" / "data"

quant_file = RAW_DATA_DIR / "Transceve Quant for DCM v2.1.xls"
qual_file = RAW_DATA_DIR / "Transceve Qual for DCM v2.1.xls"
demo_file = RAW_DATA_DIR / "Noise Solution Demographics 220426.xls"

output_file = CLEAN_DATA_DIR / "noise_solution_session_level_data.ts"

CLEAN_DATA_DIR.mkdir(parents=True, exist_ok=True)

# ============================================================
# LOAD DATA
# ============================================================

quant = pd.read_excel(quant_file)
qual = pd.read_excel(qual_file)
demo = pd.read_excel(demo_file)

# Clean column names
for df in [quant, qual, demo]:
    df.columns = df.columns.str.strip()

# ============================================================
# HELPERS
# ============================================================

def find_col(df, possible_names):
    """
    Find a matching column name regardless of casing/spacing.
    """

    normalized = {
        col.lower().strip(): col
        for col in df.columns
    }

    for name in possible_names:
        key = name.lower().strip()

        if key in normalized:
            return normalized[key]

    return None


def mode_or_first(series):
    """
    Return mode if available.
    Otherwise return first non-null value.
    """

    s = series.dropna()

    if len(s) == 0:
        return None

    mode_vals = s.mode()

    if len(mode_vals) > 0:
        return mode_vals.iloc[0]

    return s.iloc[0]

# ============================================================
# QUANTITATIVE COLUMN MAPPING
# ============================================================

competence_col = find_col(quant, [
    "Sense Of Competence",
    "Sense of Competence"
])

autonomy_col = find_col(quant, [
    "Sense Of Autonomy",
    "Sense of Autonomy"
])

relatedness_col = find_col(quant, [
    "Sense Of Relatedness",
    "Sense of Relatedness"
])

session_rating_col = find_col(quant, [
    "Session Rating Overall"
])

session_start_col = find_col(quant, [
    "Session Start"
])

quant["Session Start Parsed"] = pd.to_datetime(
    quant[session_start_col],
    format="%d/%m/%Y, %H:%M",
    errors="coerce"
)


# ============================================================
# CLEAN NUMERIC COLUMNS
# ============================================================

metric_cols = [
    competence_col,
    autonomy_col,
    relatedness_col,
    session_rating_col
]

metric_cols = [c for c in metric_cols if c]

for col in metric_cols:
    quant[col] = pd.to_numeric(
        quant[col],
        errors="coerce"
    )
    quant[col+ ' Std'] = quant[col]

# ============================================================
# SESSION-LEVEL QUANT AGGREGATION
# ============================================================

agg_dict = {
    "Session Analysis Name": "count",
    session_start_col: "first",
    "Session Start Parsed": "first",
}

if competence_col:
    agg_dict[competence_col] = "mean"
    agg_dict[competence_col + ' Std'] = "std"

if autonomy_col:
    agg_dict[autonomy_col] = "mean"
    agg_dict[autonomy_col + ' Std'] = "std"

if relatedness_col:
    agg_dict[relatedness_col] = "mean"
    agg_dict[relatedness_col + ' Std'] = "std"

if session_rating_col:
    agg_dict[session_rating_col] = "mean"
    agg_dict[session_rating_col + ' Std'] = "std"

session_quant = (
    quant
    .groupby(["UIN", "ID"], as_index=False)
    .agg(agg_dict)
)

rename_map = {
    "Session Analysis Name": "AI runs",
    session_start_col: "Session Start",
}

if competence_col:
    rename_map[competence_col] = "Competence Avg"
    rename_map[competence_col + ' Std'] = "Competence Std"

if autonomy_col:
    rename_map[autonomy_col] = "Autonomy Avg"
    rename_map[autonomy_col + ' Std'] = "Autonomy Std"

if relatedness_col:
    rename_map[relatedness_col] = "Relatedness Avg"
    rename_map[relatedness_col + ' Std'] = "Relatedness Std"

if session_rating_col:
    rename_map[session_rating_col] = "Session Rating Avg"
    rename_map[session_rating_col + ' Std'] = "Session Rating Std"

session_quant = session_quant.rename(columns=rename_map)

# ============================================================
# COMPUTE PARTICIPANT SESSION NUMBER
# ============================================================

session_quant = session_quant.sort_values(
    by=["UIN", "Session Start Parsed", "ID"],
    ascending=[True, True, True]
)

session_quant["Participant Session #"] = (
    session_quant
    .groupby("UIN")
    .cumcount()
    .add(1)
)

# ============================================================
# QUALITATIVE COLUMN MAPPING
# ============================================================

positive_overall_col = find_col(qual, [
    "Most Positive Sentence Overall"
])

negative_overall_col = find_col(qual, [
    "Most Negative Sentence Overall"
])

positive_autonomy_col = find_col(qual, [
    "Most Positive Sentence Autonomy"
])

positive_competence_col = find_col(qual, [
    "Most Positive Sentence Competence"
])

positive_relatedness_col = find_col(qual, [
    "Most Positive Sentence Relatedness"
])

negative_autonomy_col = find_col(qual, [
    "Most Negative Sentence Autonomy"
])

negative_competence_col = find_col(qual, [
    "Most Negative Sentence Competence"
])

negative_relatedness_col = find_col(qual, [
    "Most Negative Sentence Relatedness"
])

# ============================================================
# QUALITATIVE SESSION-LEVEL AGGREGATION
# ============================================================

qual_agg = {}

if positive_overall_col:
    qual_agg[positive_overall_col] = mode_or_first

if negative_overall_col:
    qual_agg[negative_overall_col] = mode_or_first

if positive_autonomy_col:
    qual_agg[positive_autonomy_col] = mode_or_first

if positive_competence_col:
    qual_agg[positive_competence_col] = mode_or_first

if positive_relatedness_col:
    qual_agg[positive_relatedness_col] = mode_or_first

if negative_autonomy_col:
    qual_agg[negative_autonomy_col] = mode_or_first

if negative_competence_col:
    qual_agg[negative_competence_col] = mode_or_first

if negative_relatedness_col:
    qual_agg[negative_relatedness_col] = mode_or_first

session_qual = (
    qual
    .groupby(["UIN", "ID"], as_index=False)
    .agg(qual_agg)
)

# ============================================================
# DEMOGRAPHICS
# ============================================================

demo = demo.drop_duplicates(subset=["UIN"])

# ============================================================
# MERGE ALL DATASETS
# ============================================================

session_level = (
    session_quant
    .merge(session_qual, on=["UIN", "ID"], how="left")
    .merge(demo, on=["UIN"], how="left")
)

# ============================================================
# CLEAN NaN FOR JSON EXPORT
# ============================================================

session_level = session_level.where(
    pd.notnull(session_level),
    None
)

# ============================================================
# EXPORT AS TS MODULE
# ============================================================

records = session_level.to_dict(orient="records")

with open(output_file, "w", encoding="utf-8") as f:
    f.write("""export type DashboardRow = {
  [key: string]: string | number | null
}

export const dashboardData: DashboardRow[] = """)

    json.dump(
        records,
        f,
        ensure_ascii=False,
        indent=2,
        default=str
    )

    f.write(";\n")

# ============================================================
# DONE
# ============================================================

print(f"Saved to: {output_file}")
print(f"Rows: {len(records)}")