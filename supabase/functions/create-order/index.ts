/** POST /functions/v1/create-order — voir src/server/createOrder.ts. */
import { handleCreateOrder } from '@/server/createOrder.ts';
import { createOrderDeps, serviceClient } from '../_shared/db.ts';

const deps = createOrderDeps(serviceClient());

Deno.serve((request) => handleCreateOrder(request, deps));
