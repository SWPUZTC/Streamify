// MongoDB Atlas 连接调试脚本
import mongoose from 'mongoose';
import 'dotenv/config'

// 详细的连接调试函数
async function debugMongoConnection() {
    console.log('=== MongoDB Atlas 连接调试 ===\n');
    
    // 1. 检查环境变量
    console.log('1. 检查连接字符串:');
    console.log(process.env);
    const mongoUri = process.env.MONGO_URL;
    if (!mongoUri) {
        console.error('❌ MONGO_URL 环境变量未设置');
        return;
    }
    
    // 安全地显示连接字符串（隐藏密码）
    const maskedUri = mongoUri.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@');
    console.log('✅ 连接字符串:', maskedUri);
    console.log('');
    
    // 2. 检查网络连接
    console.log('2. 检查网络连接:');
    try {
        const response = await fetch('https://httpbin.org/ip');
        const data = await response.json();
        console.log('✅ 当前公网IP:', data.origin);
    } catch (error) {
        console.log('❌ 无法获取公网IP:', error.message);
    }
    console.log('');
    
    // 3. 尝试连接 MongoDB
    console.log('3. 尝试连接 MongoDB Atlas:');
    
    // 设置详细的连接选项
    const options = {
        serverSelectionTimeoutMS: 10000, // 10秒超时
        socketTimeoutMS: 45000,
        bufferMaxEntries: 0,
        useNewUrlParser: true,
        useUnifiedTopology: true,
    };
    
    try {
        console.log('⏳ 正在连接...');
        const startTime = Date.now();
        
        await mongoose.connect(mongoUri, options);
        
        const endTime = Date.now();
        console.log(`✅ 连接成功! 耗时: ${endTime - startTime}ms`);
        console.log('✅ 连接状态:', mongoose.connection.readyState);
        console.log('✅ 数据库名称:', mongoose.connection.name);
        console.log('✅ 主机:', mongoose.connection.host);
        
        // 测试数据库操作
        console.log('\n4. 测试数据库操作:');
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log('✅ 可用集合数量:', collections.length);
        
        await mongoose.disconnect();
        console.log('✅ 已断开连接');
        
    } catch (error) {
        console.error('❌ 连接失败:', error.message);
        console.error('❌ 错误代码:', error.code);
        console.error('❌ 错误原因:', error.reason?.type);
        
        // 分析常见错误
        if (error.message.includes('IP') || error.message.includes('whitelist')) {
            console.log('\n🔍 IP访问控制问题诊断:');
            console.log('- 检查 MongoDB Atlas 中的 Network Access > IP Access List');
            console.log('- 确保你的IP地址在白名单中');
            console.log('- 如果使用 0.0.0.0/0，确保配置正确且已生效');
        }
        
        if (error.message.includes('authentication')) {
            console.log('\n🔍 认证问题诊断:');
            console.log('- 检查用户名和密码是否正确');
            console.log('- 确保数据库用户有适当权限');
            console.log('- 检查密码中是否有特殊字符需要URL编码');
        }
    }
}

// 运行调试
debugMongoConnection().catch(console.error);