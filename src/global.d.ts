import { ISession } from "@interfaces/session";

/**
 * Extend the express module a bit, so we can safely store some information in request objects.
 */
declare module "express" {
    interface Request {
        /**
         * Current user.
         */
        user?: ISession;
    }
}

// First, define a type that, when passed a union of keys, creates an object which
// cannot have those properties. I couldn't find a way to use this type directly,
// but it can be used with the below type.
type Impossible<K extends keyof any> = {
    [P in K]: never;
};

// The secret sauce! Provide it the type that contains only the properties you want,
// and then a type that extends that type, based on what the caller provided
// using generics.
type Restricted<T, U extends T = T> = U & Impossible<Exclude<keyof U, keyof T>>;
