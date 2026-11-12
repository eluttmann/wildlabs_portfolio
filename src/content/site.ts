/**
 * Site-wide copy shared by the 2D gallery and the 3D world. The headline is set in sentence case here and shown in
 * capitals by CSS, so screen readers read it as words. Lines break where a wide screen breaks them.
 */
export const HEADLINE_LINES = ["Enable access to", "understanding & action", "through spatial AI"] as const;

export const HEADLINE = HEADLINE_LINES.join(" ");
