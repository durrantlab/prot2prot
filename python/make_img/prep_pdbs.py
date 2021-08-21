# __pragma__ ('skip')
import json
import glob
# __pragma__ ('noskip')


vdw = {
    "H": 1.2,
    "C": 1.7,
    "N": 1.55,
    "O": 1.52,
    "F": 1.47,
    "P": 1.8,
    "S": 1.8,
    "B": 2.0,
    "LI": 1.82,
    "NA": 2.27,
    "MG": 1.73,
    "AL": 2.00,
    "CL": 1.75,
    "CA": 2.00,
    "MN": 2.00,
    "FE": 2.00,
    "CO": 2.00,
    "CU": 1.40,
    "ZN": 1.39,
    "AS": 1.85,
    "BR": 1.85,
    "MO": 2.00,
    "RH": 2.00,
    "AG": 1.72,
    "AU": 1.66,
    "PB": 2.02,
    "BI": 2.00,
    "K": 2.75,
    "I": 1.98,
}


def from_pdb_txt(pdb_txt):
    lines = pdb_txt.split("\n")
    lines = [
        l.strip()
        for l in lines
        if (l.startswith("ATOM ") or "ENDMDL" in l)
        and not " HOH " in l
        and not " WAT " in l
        and not " TIP" in l
    ]

    if "ENDMDL" in lines:
        lines = lines[: lines.index("ENDMDL")]

    # Get the coordinates
    coors = [(float(l[30:38]), float(l[38:46]), float(l[46:54])) for l in lines]

    # Also elements
    elems = [l[-2:].strip() for l in lines]

    vdws = [vdw[e] for e in elems]

    return {"coors": coors, "elems": elems, "vdws": vdws}

# __pragma__ ('skip')
def from_files_in_cur_dir():
    pdbs = {}

    for f in glob.glob("*.pdb")[:2]:
        # Keep only the protein
        pdb_txt = open(f).read()
        pdbs[f] = from_pdb_txt(pdb_txt)

        # Center the protein
        center = [0, 0, 0]
        for c in pdbs[f]["coors"]:
            for i in range(3):
                center[i] = center[i] + c[i]
        center = [c / len(pdbs[f]["coors"]) for c in center]
        pdbs[f]["coors"] = [
            [
                round(c[0] - center[0], 3),
                round(c[1] - center[1], 3),
                round(c[2] - center[2], 3),
            ]
            for c in pdbs[f]["coors"]
        ]


    with open("../make_img/pdbs.py", "w") as f:
        f.write("pdb_files = " + json.dumps(pdbs))
        f.write("\n")
# __pragma__ ('noskip')