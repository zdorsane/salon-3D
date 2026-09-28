/** POST /functions/v1/track-order — voir src/server/trackOrder.ts. */
import { handleTrackOrder } from '@/server/trackOrder.ts';
import { serviceClient, trackOrderDeps } from '../_shared/db.ts';

const deps = trackOrderDeps(serviceClient());

Deno.serve((request) => handleTrackOrder(request, deps));
