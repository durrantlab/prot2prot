import { vdwRadii } from "./VDWRadii";

// Some atoms will be merged into one for the purposes of prediction.
export let mergeAtomsData = {
    "S": [
        ["S", "SE"],
        [128, 0, 0],
        vdwRadii["S"]
    ],
    "D": [
        ["I", "BR", "K", "NA"],
        [64, 0, 0],
        0.25 * (vdwRadii["I"] + vdwRadii["BR"] + vdwRadii["K"] + vdwRadii["NA"])
    ],
    "E": [
        ["CL", "F"],
        [0, 64, 0],
        0.5 * (vdwRadii["CL"] + vdwRadii["F"])
    ],
    "G": [
        ["FE", "MG", "ZN", "NI", "MN", "AU", "CU", "CO", "AG"],
        [64, 64, 0],
        (1 / 9.0) * (
            vdwRadii["FE"] + vdwRadii["MG"] + vdwRadii["ZN"] + vdwRadii["NI"] +
            vdwRadii["MN"] + vdwRadii["AU"] + vdwRadii["CU"] + vdwRadii["CO"] +
            vdwRadii["AG"]
        )
    ]
}