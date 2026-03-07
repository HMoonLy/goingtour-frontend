<template>
  <div class="admin-page">
    <h2>后台管理中心</h2>
    <p class="desc">管理员可在此执行用户治理、内容审核、举报处理、监控与安全处置。</p>

    <el-row :gutter="12" class="stats-row">
      <el-col :xs="12" :sm="8" :md="4"><el-card class="stat"><div class="k">{{ stats.totalUsers || 0 }}</div><div class="v">总用户</div></el-card></el-col>
      <el-col :xs="12" :sm="8" :md="4"><el-card class="stat"><div class="k">{{ stats.bannedUsers || 0 }}</div><div class="v">封禁用户</div></el-card></el-col>
      <el-col :xs="12" :sm="8" :md="4"><el-card class="stat"><div class="k">{{ stats.totalPosts || 0 }}</div><div class="v">帖子总数</div></el-card></el-col>
      <el-col :xs="12" :sm="8" :md="4"><el-card class="stat"><div class="k">{{ stats.totalComments || 0 }}</div><div class="v">评论总数</div></el-card></el-col>
      <el-col :xs="12" :sm="8" :md="4"><el-card class="stat"><div class="k">{{ stats.pendingReports || 0 }}</div><div class="v">待处理举报</div></el-card></el-col>
      <el-col :xs="12" :sm="8" :md="4"><el-card class="stat"><div class="k">{{ stats.activeUsers7d || 0 }}</div><div class="v">7日活跃</div></el-card></el-col>
    </el-row>

    <el-tabs v-model="tab">
      <el-tab-pane label="用户管理" name="users">
        <div class="toolbar">
          <el-input v-model="userQuery.keyword" placeholder="搜索邮箱/昵称" clearable style="width: 260px" />
          <el-select v-model="userQuery.status" placeholder="状态" clearable style="width: 140px">
            <el-option label="ACTIVE" value="ACTIVE" />
            <el-option label="BANNED" value="BANNED" />
          </el-select>
          <el-button type="primary" @click="loadUsers">查询</el-button>
        </div>
        <el-table :data="users" border v-loading="loading.users">
          <el-table-column prop="id" label="ID" width="80" />
          <el-table-column prop="email" label="邮箱" min-width="220" />
          <el-table-column prop="nickname" label="昵称" min-width="120" />
          <el-table-column prop="role" label="角色" width="120" />
          <el-table-column prop="status" label="状态" width="100" />
          <el-table-column prop="banReason" label="封禁原因" min-width="180" show-overflow-tooltip />
          <el-table-column label="操作" width="200">
            <template #default="{ row }">
              <el-button v-if="row.status !== 'BANNED' && row.role !== 'ADMIN' && row.role !== 'ROLE_ADMIN'" size="small" type="danger" @click="banUser(row)">封禁</el-button>
              <el-button v-if="row.status === 'BANNED'" size="small" type="success" @click="unbanUser(row)">解封</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>

      <el-tab-pane label="社区内容管理" name="content">
        <div class="toolbar">
          <el-radio-group v-model="contentMode">
            <el-radio-button label="posts">帖子</el-radio-button>
            <el-radio-button label="comments">评论</el-radio-button>
          </el-radio-group>
          <el-input v-model="contentQuery.keyword" placeholder="关键词" clearable style="width: 260px" />
          <el-select v-model="contentQuery.deleted" style="width: 140px">
            <el-option label="正常" :value="0" />
            <el-option label="已删除" :value="1" />
          </el-select>
          <el-button type="primary" @click="loadContent">查询</el-button>
        </div>

        <el-table v-if="contentMode === 'posts'" :data="posts" border v-loading="loading.posts">
          <el-table-column prop="id" label="帖子ID" width="90" />
          <el-table-column prop="title" label="标题" min-width="200" show-overflow-tooltip />
          <el-table-column prop="authorNickname" label="作者" width="120" />
          <el-table-column prop="deleted" label="状态" width="100">
            <template #default="{ row }"><el-tag :type="row.deleted === 1 ? 'danger' : 'success'">{{ row.deleted === 1 ? "已下架" : "正常" }}</el-tag></template>
          </el-table-column>
          <el-table-column label="操作" width="140">
            <template #default="{ row }"><el-button v-if="row.deleted !== 1" size="small" type="danger" @click="removePost(row)">下架</el-button></template>
          </el-table-column>
        </el-table>

        <el-table v-else :data="comments" border v-loading="loading.comments">
          <el-table-column prop="id" label="评论ID" width="90" />
          <el-table-column prop="postTitle" label="帖子标题" min-width="180" show-overflow-tooltip />
          <el-table-column prop="authorNickname" label="作者" width="120" />
          <el-table-column prop="content" label="评论内容" min-width="220" show-overflow-tooltip />
          <el-table-column prop="deleted" label="状态" width="100">
            <template #default="{ row }"><el-tag :type="row.deleted === 1 ? 'danger' : 'success'">{{ row.deleted === 1 ? "已删除" : "正常" }}</el-tag></template>
          </el-table-column>
          <el-table-column label="操作" width="140">
            <template #default="{ row }"><el-button v-if="row.deleted !== 1" size="small" type="danger" @click="removeComment(row)">删除</el-button></template>
          </el-table-column>
        </el-table>
      </el-tab-pane>

      <el-tab-pane label="举报处理" name="reports">
        <div class="toolbar">
          <el-select v-model="reportQuery.status" placeholder="状态" clearable style="width: 180px">
            <el-option label="PENDING" value="PENDING" />
            <el-option label="RESOLVED" value="RESOLVED" />
            <el-option label="REJECTED" value="REJECTED" />
          </el-select>
          <el-button type="primary" @click="loadReports">查询</el-button>
        </div>
        <el-table :data="reports" border v-loading="loading.reports">
          <el-table-column prop="id" label="举报ID" width="90" />
          <el-table-column prop="target_type" label="目标类型" width="110" />
          <el-table-column prop="target_id" label="目标ID" width="90" />
          <el-table-column prop="reason_detail" label="举报详情" min-width="220" show-overflow-tooltip />
          <el-table-column prop="status" label="状态" width="110" />
          <el-table-column label="操作" width="240">
            <template #default="{ row }">
              <el-button v-if="row.status === 'PENDING'" size="small" @click="handleReport(row, 'RESOLVED', 'NONE')">通过</el-button>
              <el-button v-if="row.status === 'PENDING'" size="small" type="danger" @click="handleReport(row, 'RESOLVED', row.target_type === 'POST' ? 'DELETE_POST' : row.target_type === 'COMMENT' ? 'DELETE_COMMENT' : 'BAN_USER')">处置</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>

      <el-tab-pane label="运行监控" name="monitor">
        <div class="toolbar"><el-button type="primary" @click="loadMonitor">刷新监控</el-button></div>
        <el-descriptions :column="2" border>
          <el-descriptions-item label="7日新增用户">{{ monitor.business?.newUsers7d || 0 }}</el-descriptions-item>
          <el-descriptions-item label="7日发帖">{{ monitor.business?.posts7d || 0 }}</el-descriptions-item>
          <el-descriptions-item label="7日评论">{{ monitor.business?.comments7d || 0 }}</el-descriptions-item>
          <el-descriptions-item label="7日AI行程">{{ monitor.business?.aiTrips7d || 0 }}</el-descriptions-item>
          <el-descriptions-item label="24小时失败登录">{{ monitor.business?.failedLogins24h || 0 }}</el-descriptions-item>
          <el-descriptions-item label="运行时长(秒)">{{ monitor.runtime?.uptimeSeconds || 0 }}</el-descriptions-item>
          <el-descriptions-item label="堆内存已用">{{ monitor.runtime?.heapUsed || 0 }}</el-descriptions-item>
          <el-descriptions-item label="堆内存最大">{{ monitor.runtime?.heapMax || 0 }}</el-descriptions-item>
        </el-descriptions>
      </el-tab-pane>

      <el-tab-pane label="系统配置" name="configs">
        <div class="toolbar">
          <el-input v-model="configQuery.keyword" placeholder="配置关键词" clearable style="width: 280px" />
          <el-button type="primary" @click="loadConfigs">查询</el-button>
        </div>
        <el-table :data="configs" border v-loading="loading.configs">
          <el-table-column prop="configKey" label="配置键" min-width="220" />
          <el-table-column prop="configValue" label="配置值" min-width="180" show-overflow-tooltip />
          <el-table-column prop="description" label="说明" min-width="260" show-overflow-tooltip />
          <el-table-column label="操作" width="140">
            <template #default="{ row }"><el-button size="small" type="primary" @click="editConfig(row)">编辑</el-button></template>
          </el-table-column>
        </el-table>
      </el-tab-pane>

      <el-tab-pane label="异常与安全" name="security">
        <div class="toolbar">
          <el-input v-model="securityForm.userId" placeholder="用户ID" style="width: 140px" />
          <el-input v-model="securityForm.reason" placeholder="应急封禁原因" style="width: 300px" />
          <el-button type="danger" @click="emergencyBan">应急封禁(30天)</el-button>
          <el-button type="primary" @click="loadSecurity">刷新安全事件</el-button>
        </div>
        <el-table :data="security.events || []" border>
          <el-table-column prop="eventType" label="事件类型" width="140" />
          <el-table-column prop="level" label="等级" width="100" />
          <el-table-column prop="targetType" label="目标类型" width="110" />
          <el-table-column prop="targetId" label="目标ID" width="90" />
          <el-table-column prop="detail" label="详情" min-width="260" show-overflow-tooltip />
          <el-table-column prop="eventTime" label="时间" min-width="180" />
        </el-table>
        <div class="toolbar mt12">
          <el-input v-model="opQuery.operationType" placeholder="操作类型筛选" clearable style="width: 220px" />
          <el-button @click="loadOperationLogs">加载操作日志</el-button>
        </div>
        <el-table :data="operationLogs" border v-loading="loading.operationLogs">
          <el-table-column prop="operation_type" label="操作类型" width="180" />
          <el-table-column prop="target_type" label="目标类型" width="110" />
          <el-table-column prop="target_id" label="目标ID" width="90" />
          <el-table-column prop="admin_nickname" label="管理员" width="120" />
          <el-table-column prop="operation_detail" label="详情" min-width="260" show-overflow-tooltip />
          <el-table-column prop="create_time" label="时间" min-width="180" />
        </el-table>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { adminApi } from "@/api/admin";

const tab = ref("users");
const contentMode = ref("posts");
const stats = ref({});
const monitor = ref({ business: {}, runtime: {} });
const security = ref({ summary: {}, ipRisks: [], events: [] });
const users = ref([]);
const posts = ref([]);
const comments = ref([]);
const reports = ref([]);
const configs = ref([]);
const operationLogs = ref([]);

const loading = reactive({ users: false, posts: false, comments: false, reports: false, configs: false, operationLogs: false });
const userQuery = reactive({ keyword: "", status: "", page: 1, size: 10 });
const contentQuery = reactive({ keyword: "", deleted: 0, page: 1, size: 10 });
const reportQuery = reactive({ status: "PENDING", page: 1, size: 10 });
const configQuery = reactive({ keyword: "" });
const opQuery = reactive({ operationType: "", page: 1, size: 10 });
const securityForm = reactive({ userId: "", reason: "" });

const loadStats = async () => { stats.value = (await adminApi.getDashboardStats()).data || {}; };
const loadUsers = async () => {
  loading.users = true;
  try { users.value = (await adminApi.getUsers(userQuery)).data?.records || []; } finally { loading.users = false; }
};
const loadPosts = async () => {
  loading.posts = true;
  try { posts.value = (await adminApi.getPosts(contentQuery)).data?.records || []; } finally { loading.posts = false; }
};
const loadComments = async () => {
  loading.comments = true;
  try { comments.value = (await adminApi.getComments(contentQuery)).data?.records || []; } finally { loading.comments = false; }
};
const loadContent = async () => (contentMode.value === "posts" ? loadPosts() : loadComments());
const loadReports = async () => {
  loading.reports = true;
  try { reports.value = (await adminApi.getReports(reportQuery)).data?.records || []; } finally { loading.reports = false; }
};
const loadMonitor = async () => { monitor.value = (await adminApi.getMonitorOverview()).data || { business: {}, runtime: {} }; };
const loadConfigs = async () => {
  loading.configs = true;
  try { configs.value = (await adminApi.getConfigs(configQuery)).data?.records || []; } finally { loading.configs = false; }
};
const loadSecurity = async () => { security.value = (await adminApi.getSecurityEvents({ days: 7, size: 30 })).data || { summary: {}, ipRisks: [], events: [] }; };
const loadOperationLogs = async () => {
  loading.operationLogs = true;
  try { operationLogs.value = (await adminApi.getOperationLogs(opQuery)).data?.records || []; } finally { loading.operationLogs = false; }
};

const banUser = async (row) => {
  const reason = await ElMessageBox.prompt("请输入封禁原因", "封禁用户").then((res) => res.value);
  await adminApi.banUser(row.id, { reason, banUntil: null });
  ElMessage.success("封禁成功");
  await Promise.all([loadUsers(), loadStats(), loadSecurity()]);
};
const unbanUser = async (row) => {
  await adminApi.unbanUser(row.id);
  ElMessage.success("解封成功");
  await Promise.all([loadUsers(), loadStats(), loadSecurity()]);
};
const removePost = async (row) => {
  const reason = await ElMessageBox.prompt("请输入下架原因", "下架帖子").then((res) => res.value);
  await adminApi.removePost(row.id, { reason });
  ElMessage.success("帖子已下架");
  await Promise.all([loadPosts(), loadStats()]);
};
const removeComment = async (row) => {
  const reason = await ElMessageBox.prompt("请输入删除原因", "删除评论").then((res) => res.value);
  await adminApi.removeComment(row.id, { reason });
  ElMessage.success("评论已删除");
  await Promise.all([loadComments(), loadStats()]);
};
const handleReport = async (row, status, action) => {
  await adminApi.handleReport(row.id, { status, action, handledResult: "管理员处置" });
  ElMessage.success("举报处理完成");
  await Promise.all([loadReports(), loadStats(), loadSecurity()]);
};
const editConfig = async (row) => {
  const value = await ElMessageBox.prompt("请输入新的配置值", `编辑 ${row.configKey}`, { inputValue: row.configValue || "" }).then((res) => res.value);
  await adminApi.updateConfig(row.configKey, { configValue: value, description: row.description || "" });
  ElMessage.success("配置更新成功");
  await Promise.all([loadConfigs(), loadOperationLogs()]);
};
const emergencyBan = async () => {
  const userId = Number(securityForm.userId);
  if (!Number.isInteger(userId) || userId <= 0 || !securityForm.reason?.trim()) {
    ElMessage.warning("请填写正确的用户ID和封禁原因");
    return;
  }
  await adminApi.emergencyBanUser(userId, { reason: securityForm.reason.trim(), banUntil: null });
  ElMessage.success("应急封禁成功");
  securityForm.userId = "";
  securityForm.reason = "";
  await Promise.all([loadUsers(), loadStats(), loadSecurity(), loadOperationLogs()]);
};

onMounted(async () => {
  await Promise.all([loadStats(), loadUsers(), loadPosts(), loadReports(), loadMonitor(), loadConfigs(), loadSecurity(), loadOperationLogs()]);
});
</script>

<style scoped>
.admin-page { padding: 8px; }
.desc { color: #666; margin-bottom: 16px; }
.stats-row { margin-bottom: 12px; }
.stat { text-align: center; }
.stat .k { font-size: 22px; font-weight: 700; }
.stat .v { color: #666; font-size: 12px; }
.toolbar { display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 12px; }
.mt12 { margin-top: 12px; }
</style>

