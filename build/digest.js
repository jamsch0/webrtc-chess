/**
 * Returns the digest of the given text as a hexadecimal string.
 * By default, the SHA-256 hash algorithm is used.
 */
export default async function digest(text, algorithm = "SHA-256") {
    const data = new TextEncoder().encode(text);
    const hash = new Uint8Array(await crypto.subtle.digest(algorithm, data));
    return Array.from(hash)
        .map(byte => byte.toString(16).padStart(2, "0"))
        .join("");
}
