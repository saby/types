/**
 * @kaizen_zone 8024d986-a103-40a2-9572-c376c2c38fa5
 */
/**
 * Библиотека отношений.
 * @library Types/_entity/relation
 * @includes Hierarchy Types/_entity/relation/Hierarchy
 * @includes IReceiver Types/_entity/relation/IReceiver
 * @public
 */

/*
 * Relations library.
 * @library Types/_entity/relation
 * @includes Hierarchy Types/_entity/relation/Hierarchy
 * @includes IReceiver Types/_entity/relation/IReceiver
 * @public
 * @author Буранов А.Р.
 */

export { default as Hierarchy } from './relation/Hierarchy';
export { default as IReceiver } from './relation/IReceiver';
export { ClearType as ManyToManyClearType } from './relation/ManyToMany';
