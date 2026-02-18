/// Type safe ID for database entities
/// Use explicit cast to convert number to Id<T>
export type Id<T extends string> = number & { __type: T };