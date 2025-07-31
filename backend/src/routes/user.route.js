import express from 'express';
import { protectRoute } from '../middleware/auth.middleware.js';
import { 
    getRecommendUsers, 
    getMyFriends, 
    sendFriendRequest, 
    acceptFriendRequest,
    getFriendRequest,
    getOutgoingFriendRequest,
    rejectFriendRequest, 
    deleteFriend,
} from '../controllers/user.controller.js';


const router = express.Router();
router.use(protectRoute);

router.get("/", getRecommendUsers);
router.get("/friends", getMyFriends);

router.post("/friend-request/:id", sendFriendRequest);
router.put("/friend-request/:id/accept", acceptFriendRequest);
router.put("/friend-request/:id/reject", rejectFriendRequest);

router.get("/friend-request", getFriendRequest);
router.get("/outgoing-friend-request", getOutgoingFriendRequest);

router.delete("/friends/:id", deleteFriend);

export default router;