import User from "../models/user.js";
import FriendRequest from "../models/FriendRequest.js";
export async function getRecommendUsers(req, res) {
    try {
        const currentUserId = req.user.id;
        const currentUser = req.user;

        const recommendedUsers = await User.find({
            $and: [
                { _id: { $ne: currentUserId } }, //排除当前用户
                { _id: { $nin: currentUser.friends } }, //排除当前用户朋友
                { isOnboarded: true }
            ]
        })
        res.status(200).json(recommendedUsers);
    } catch (error) {
        console.error("Error recommending friend request:", error.message);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}

export async function getMyFriends(req, res) {
    try {
        const user = await User.findById(req.user.id)
            .select('friends')
            .populate('friends', "name avatar nativelanguage learninglanguage")
        res.status(200).json(user.friends);
    } catch (error) {
        console.error("Error getting friend request:", error.message);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}

export async function sendFriendRequest(req, res) {
    try {
        const id = req.user.id;
        const { id: recipientId } = req.params;

        if (id === recipientId) return res.status(400).json({ message: '不能添加自己为好友' });

        const recipient = await User.findById(recipientId);
        if (!recipient) return res.status(404).json({ message: '用户不存在' });
        if (recipient.friends.includes(id)) return res.status(400).json({ message: '已经是好友' });

        const existingRequest = await FriendRequest.findOne({
            $or: [
                { sender: id, recipient: recipientId },
                { sender: recipientId, recipient: id }
            ]
        });
        if (existingRequest) return res.status(400).json({ message: '请求已存在' });

        const friendRequest = await FriendRequest.create({
            sender: id,
            recipient: recipientId,
            status: 'pending'
        });

        res.status(201).json({ message: '请求已发送' });
    } catch (error) {
        console.error("Error sending friend request:", error.message);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}

export async function acceptFriendRequest(req, res) {
    try {
        const { id: recipientId } = req.params;
        const friendRequest = await FriendRequest.findById(recipientId);
        if (!friendRequest) return res.status(404).json({ message: '请求不存在' });

        //如果当前用户不是请求的接收者
        if(friendRequest.recipient.toString() !== req.user.id) {
            return res.status(403).json({ message: '无权限' });
        }

        friendRequest.status = 'accepted';
        await friendRequest.save();

        //创建好友关系
        await User.findByIdAndUpdate(friendRequest.sender, { $addToSet: { friends: friendRequest.recipient } });
        await User.findByIdAndUpdate(friendRequest.recipient, { $addToSet: { friends: friendRequest.sender } });

        return res.status(200).json({ message: '好友请求已接受' });
    } catch (error) {
        console.error("Error accepting friend request:", error.message);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}

export async function getFriendRequest(req, res) {
    try {
        const friendRequest = await FriendRequest.find({
            recipient: req.user.id,
            status: 'pending'
        }).populate('sender', 'name avatar nativelanguage learninglanguage');

        const acceptedRequest = await FriendRequest.find({
            recipient: req.user.id,
            status: 'accepted'
        }).populate('recipient', 'name avatar');
        res.status(200).json({ friendRequest, acceptedRequest });
    } catch (error) {
        console.error("Error fetching friend requests:", error.message);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}

export async function getOutgoingFriendRequest(req, res) { 
    try {
        const outgoingRequest = await FriendRequest.find({
            sender: req.user.id,
            status: 'pending'
        }).populate('recipient', 'name avatar nativelanguage learninglanguage');
        res.status(200).json(outgoingRequest);
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}

export async function rejectFriendRequest(req, res) {
    try {
        const requestId = req.params.id;
        const request = await FriendRequest.findById(requestId);
        if (!request) return res.status(404).json({ message: '请求不存在' });
        if (request.recipient.toString() !== req.user.id) return res.status(403).json({ message: '无权限' });
        if (request.status !== 'pending') return res.status(400).json({ message: '请求已处理' });
        await FriendRequest.findByIdAndUpdate(requestId, { status: 'rejected' });
        return res.status(200).json({ message: '请求已拒绝' });
    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ message: '服务器错误' });
    }
}

export async function deleteFriend(req, res) {
    try {
        const { friendId } = req.body;
        await User.findOneAndDelete(friendId, { friends: req.user.id });
        await User.findOneAndDelete(req.user.id, { friends: friendId });
        return res.status(200).json({ message: '删除成功' });
    } catch (error) {
        console.error('delete error', error.message);
        return res.status(500).json({ message: '服务器错误' });
    }   
}