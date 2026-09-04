import type { WorkflowRepository, WorkflowSnapshot } from "./types";

const emptySnapshot = (): WorkflowSnapshot => ({
  interests: [],
  conversations: [],
  visits: [],
  contactConsents: [],
});

const copy = <T>(value: T): T => structuredClone(value);

/**
 * Development adapter for the workflow. React components never read this data
 * directly; a future database-backed implementation can satisfy the same
 * WorkflowRepository contract.
 */
export function createMockWorkflowRepository(
  initialSnapshot: WorkflowSnapshot = emptySnapshot(),
): WorkflowRepository {
  let snapshot = copy(initialSnapshot);
  let pendingTransaction = Promise.resolve();

  return {
    load: async () => copy(snapshot),
    save: async (nextSnapshot) => {
      snapshot = copy(nextSnapshot);
    },
    transact: async (operation) => {
      const transaction = pendingTransaction.then(async () => {
        const draft = copy(snapshot);
        const result = await operation(draft);
        snapshot = copy(draft);
        return copy(result);
      });
      pendingTransaction = transaction.then(
        () => undefined,
        () => undefined,
      );
      return transaction;
    },
  };
}
