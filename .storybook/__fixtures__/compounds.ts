export interface Compound {
  id: string
  name: string
  formula: string
  mw: number
  category: string
  status: string
  purity: number
  detail: string
}

const compoundsData: Compound[] = [
  { id: "1", name: "Aspirin", formula: "C\u2089H\u2088O\u2084", mw: 180.16, category: "Analgesic", status: "Active", purity: 99.2, detail: "Acetylsalicylic acid. Common NSAID used for pain relief, fever reduction, and anti-inflammatory purposes." },
  { id: "2", name: "Caffeine", formula: "C\u2088H\u2081\u2080N\u2084O\u2082", mw: 194.19, category: "Stimulant", status: "Active", purity: 98.5, detail: "Methylxanthine alkaloid. Central nervous system stimulant found in coffee, tea, and various beverages." },
  { id: "3", name: "Ibuprofen", formula: "C\u2081\u2083H\u2081\u2088O\u2082", mw: 206.29, category: "Analgesic", status: "Active", purity: 99.8, detail: "Propionic acid derivative NSAID. Commonly used for inflammation, pain, and fever." },
  { id: "4", name: "Penicillin G", formula: "C\u2081\u2086H\u2081\u2088N\u2082O\u2084S", mw: 334.39, category: "Antibiotic", status: "Inactive", purity: 97.1, detail: "Beta-lactam antibiotic. First member of the penicillin group discovered by Alexander Fleming." },
  { id: "5", name: "Metformin", formula: "C\u2084H\u2081\u2081N\u2085", mw: 129.16, category: "Antidiabetic", status: "Active", purity: 99.0, detail: "Biguanide oral antidiabetic. First-line medication for the treatment of type 2 diabetes." },
  { id: "6", name: "Omeprazole", formula: "C\u2081\u2087H\u2081\u2089N\u2083O\u2083S", mw: 345.42, category: "Antacid", status: "Active", purity: 98.9, detail: "Proton-pump inhibitor (PPI). Used to treat gastroesophageal reflux disease and peptic ulcers." },
  { id: "7", name: "Amoxicillin", formula: "C\u2081\u2086H\u2081\u2089N\u2083O\u2085S", mw: 365.40, category: "Antibiotic", status: "Active", purity: 96.3, detail: "Broad-spectrum beta-lactam antibiotic. Commonly prescribed for bacterial infections." },
  { id: "8", name: "Loratadine", formula: "C\u2082\u2082H\u2082\u2083ClN\u2082O\u2082", mw: 382.88, category: "Antihistamine", status: "Inactive", purity: 99.5, detail: "Second-generation antihistamine. Used to treat allergies without significant sedation." },
  { id: "9", name: "Atorvastatin", formula: "C\u2083\u2083H\u2083\u2085FN\u2082O\u2085", mw: 558.64, category: "Statin", status: "Active", purity: 99.1, detail: "HMG-CoA reductase inhibitor. Used to lower cholesterol and reduce risk of cardiovascular disease." },
  { id: "10", name: "Lisinopril", formula: "C\u2082\u2081H\u2083\u2081N\u2083O\u2085", mw: 405.49, category: "Antihypertensive", status: "Active", purity: 98.7, detail: "ACE inhibitor. Used to treat high blood pressure and heart failure." },
  { id: "11", name: "Amlodipine", formula: "C\u2082\u2080H\u2082\u2085ClN\u2082O\u2085", mw: 408.88, category: "Antihypertensive", status: "Active", purity: 99.3, detail: "Calcium channel blocker. Used for hypertension and coronary artery disease." },
  { id: "12", name: "Ciprofloxacin", formula: "C\u2081\u2087H\u2081\u2088FN\u2083O\u2083", mw: 331.34, category: "Antibiotic", status: "Active", purity: 97.8, detail: "Fluoroquinolone antibiotic. Broad-spectrum agent for urinary tract and respiratory infections." },
  { id: "13", name: "Warfarin", formula: "C\u2081\u2089H\u2081\u2086O\u2084", mw: 308.33, category: "Anticoagulant", status: "Active", purity: 99.6, detail: "Vitamin K antagonist. Used for prevention and treatment of thromboembolic disorders." },
  { id: "14", name: "Diazepam", formula: "C\u2081\u2086H\u2081\u2083ClN\u2082O", mw: 284.74, category: "Anxiolytic", status: "Inactive", purity: 99.4, detail: "Benzodiazepine. Used for anxiety, seizures, muscle spasms, and alcohol withdrawal." },
  { id: "15", name: "Prednisone", formula: "C\u2082\u2081H\u2082\u2086O\u2085", mw: 358.43, category: "Corticosteroid", status: "Active", purity: 98.2, detail: "Synthetic corticosteroid. Used as anti-inflammatory and immunosuppressant." },
  { id: "16", name: "Morphine", formula: "C\u2081\u2087H\u2081\u2089NO\u2083", mw: 285.34, category: "Analgesic", status: "Inactive", purity: 99.7, detail: "Opioid analgesic. Used for severe pain management in clinical settings." },
  { id: "17", name: "Doxycycline", formula: "C\u2082\u2082H\u2082\u2084N\u2082O\u2088", mw: 444.43, category: "Antibiotic", status: "Active", purity: 96.9, detail: "Tetracycline antibiotic. Used for bacterial infections, acne, and malaria prophylaxis." },
  { id: "18", name: "Gabapentin", formula: "C\u2089H\u2081\u2087NO\u2082", mw: 171.24, category: "Anticonvulsant", status: "Active", purity: 99.0, detail: "GABA analogue. Used for neuropathic pain and as adjunctive therapy for seizures." },
  { id: "19", name: "Levothyroxine", formula: "C\u2081\u2085H\u2081\u2081I\u2084NO\u2084", mw: 776.87, category: "Thyroid", status: "Active", purity: 98.1, detail: "Synthetic thyroid hormone. Used to treat hypothyroidism and thyroid hormone deficiency." },
  { id: "20", name: "Sildenafil", formula: "C\u2082\u2082H\u2083\u2080N\u2086O\u2084S", mw: 474.58, category: "PDE5 Inhibitor", status: "Active", purity: 99.3, detail: "Phosphodiesterase type 5 inhibitor. Used for erectile dysfunction and pulmonary arterial hypertension." },
]

export default compoundsData
