export function hasNextLigandUrlParam(): boolean {
    // Fun fact: Created w/ help from codex.
    var nextLigand = window.location.search.match(/nextLigand=([^&]+)/);

    if (nextLigand === null) {
        return false;
    }

    return true;
}
