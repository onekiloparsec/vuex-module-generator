import { getCrudMutationsObject } from './crudMutations'
import { getSelectionsMutationsObject } from './selectionMutations'
import { getSpecialMutationsObject } from './specialMutations'

export { getCrudMutationNames } from './crudMutations'

export const getMutationsObject = (root, idKey, lcrusd, allowMultipleSelection) => {
  const crudMutations = getCrudMutationsObject(root, idKey, lcrusd)
  const selectionMutations = getSelectionsMutationsObject(root, idKey, allowMultipleSelection)
  const specialMutations = getSpecialMutationsObject(root, idKey)

  return {
    ...crudMutations,
    ...selectionMutations,
    ...specialMutations
  }
}
