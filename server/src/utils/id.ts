export const generateId = (): string =>
    Math.random().toString(36).slice(3, 11);