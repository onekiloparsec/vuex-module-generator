import { getCrudMutationsObject } from './crudMutations'
import { getSelectionsMutationsObject } from './selectionMutations'
import { getSpecialMutationsObject } from './specialMutations'

export { getCrudMutationNames } from './crudMutations'

export const getMutationsObject = (root, idKey, lcrusd, multiSelection = false) => {
  const crudMutations = getCrudMutationsObject(root, idKey, lcrusd)
  const selectionMutations = getSelectionsMutationsObject(root, idKey, multiSelection)
  const specialMutations = getSpecialMutationsObject(root, idKey)

  return {
    ...crudMutations,
    ...selectionMutations,
    ...specialMutations
  }
}
