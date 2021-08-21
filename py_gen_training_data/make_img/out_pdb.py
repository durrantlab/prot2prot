def rjust(s, cnt):
    # Because transcrypt doesn't support rjust on strings.
    while len(s) < cnt:
        s = " " + s
    return s

def format_num(num):
    # __pragma__ ('skip')
    s = '{0:.3f}'.format(num)
    # __pragma__ ('noskip')

    """?
    s = num.toFixed(3)
    ?"""
    
    return s

def out_pdb(pdb_filename, coors, elems, node_params=None):
    i = 1
    pdb_txt = ""
    for c, e in zip(coors, elems):
        i_str = rjust(str(i), 6)
        e = rjust(e, 2)
        x = rjust(format_num(c[0]), 8)
        y = rjust(format_num(c[1]), 8)
        z = rjust(format_num(c[2]), 8)
        line = f"ATOM {i_str} {e}   XXX A  99    {x}{y}{z}  1.00  0.00          {e}  "

        pdb_txt = pdb_txt + line + "\n"

        i = i + 1
    
    # __pragma__ ('skip')
    with open(pdb_filename, "w") as f:
        f.write(pdb_txt)
    # __pragma__ ('noskip')

    """?
    if node_params is not None:
        # node
        node_params["fs"].writeFileSync(pdb_filename, pdb_txt);
    ?"""
