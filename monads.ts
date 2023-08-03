export {call, wrapPromise, Try, Success, Failure} from "./src/trymonad";
export {maybe, MaybeBase as Maybe, nothing, Nothing, Just, match, or, orElse, orUndefined} from "./src/maybemonad";
export {left, right, EitherBase as Either} from "./src/eithermonad";
export {flatten, forEach, clean, map, flatMap, is, Monad} from "./src/helpers";
