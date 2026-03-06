<template>
  <div class="admin-page">
    <div class="page-header">
      <h2>后台管理</h2>
      <p>用户管理与举报处理</p>
    </div>

    <el-row :gutter="12" class="stats-row">
      <el-col :xs="12" :sm="8" :md="4">
        <el-card class="stat-card">
          <div class="k">{{ stats.totalUsers || 0 }}</div>
          <div class="v">总用户</div>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="8" :md="4">
        <el-card class="stat-card">
          <div class="k">{{ stats.bannedUsers || 0 }}</div>
          <div class="v">封禁用户</div>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="8" :md="4">
        <el-card class="stat-card">
          <div class="k">{{ stats.totalPosts || 0 }}</div>
          <div class="v">帖子数</div>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="8" :md="4">
        <el-card class="stat-card">
          <div class="k">{{ stats.totalComments || 0 }}</div>
          <div class="v">评论数</div>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="8" :md="4">
        <el-card class="stat-card">
          <div class="k">{{ stats.pendingReports || 0 }}</div>
          <div class="v">待处理举报</div>
        </el-card>
      </el-col>
    </el-row>

    <el-tabs v-model="activeTab">
      <el-tab-pane label="用户管理" name="users">
        <div class="toolbar">
          <el-input
            v-model="userQuery.keyword"
            placeholder="搜索邮箱/昵称"
            clearable
            style="max-width: 260px"
            @keyup.enter="loadUsers"
          />
          <el-select
            v-model="userQuery.status"
            placeholder="状态筛选"
            clearable
            style="width: 140px"
            @change="loadUsers"
          >
            <el-option label="ACTIVE" value="ACTIVE" />
            <el-option label="BANNED" value="BANNED" />
          </el-select>
          <el-button type="primary" @click="loadUsers">查询</el-button>
        </div>

        <el-table :data="users" v-loading="loading.users" border>
          <el-table-column prop="id" label="ID" width="80" />
          <el-table-column prop="email" label="邮箱" min-width="220" />
          <el-table-column prop="nickname" label="昵称" min-width="120" />
          <el-table-column prop="role" label="角色" width="120" />
          <el-table-column prop="status" label="状态" width="100">
            <template #default="{ row }">
              <el-tag :type="row.status === 'BANNED' ? 'danger' : 'success'">{{ row.status }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="banReason" label="封禁原因" min-width="180" show-overflow-tooltip />
          <el-table-column label="操作" width="200" fixed="right">
            <template #default="{ row }">
              <el-button
                v-if="row.status !== 'BANNED' && row.role !== 'ADMIN' && row.role !== 'ROLE_ADMIN'"
                size="small"
                type="danger"
                @click="openBanDialog(row)"
              >
                封禁
              </el-button>
              <el-button v-if="row.status === 'BANNED'" size="small" type="success" @click="handleUnban(row)">
                解封
              </el-button>
            </template>
          </el-table-column>
        </el-table>

        <div class="pager">
          <el-pagination
            v-model:current-page="userQuery.page"
            v-model:page-size="userQuery.size"
            :total="userTotal"
            :page-sizes="[10, 20, 50]"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="loadUsers"
            @current-change="loadUsers"
          />
        </div>
      </el-tab-pane>

      <el-tab-pane label="举报处理" name="reports">
        <div class="toolbar">
          <el-select
            v-model="reportQuery.status"
            placeholder="状态筛选"
            clearable
            style="width: 180px"
            @change="loadReports"
          >
            <el-option label="PENDING" value="PENDING" />
            <el-option label="RESOLVED" value="RESOLVED" />
            <el-option label="REJECTED" value="REJECTED" />
          </el-select>
          <el-button type="primary" @click="loadReports">查询</el-button>
        </div>

        <el-table :data="reports" v-loading="loading.reports" border>
          <el-table-column prop="id" label="举报ID" width="90" />
          <el-table-column prop="target_type" label="目标类型" width="110" />
          <el-table-column prop="target_id" label="目标ID" width="90" />
          <el-table-column prop="reason_type" label="举报类型" width="120" />
          <el-table-column prop="reason_detail" label="举报详情" min-width="160" show-overflow-tooltip />
          <el-table-column prop="reporter_nickname" label="举报人" width="120" />
          <el-table-column prop="status" label="状态" width="110">
            <template #default="{ row }">
              <el-tag :type="statusTagType(row.status)">{{ row.status }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="220" fixed="right">
            <template #default="{ row }">
              <el-button v-if="row.status === 'PENDING'" size="small" type="primary" @click="openReportDialog(row)">
                处理
              </el-button>
              <span v-else class="muted">已处理</span>
            </template>
          </el-table-column>
        </el-table>

        <div class="pager">
          <el-pagination
            v-model:current-page="reportQuery.page"
            v-model:page-size="reportQuery.size"
            :total="reportTotal"
            :page-sizes="[10, 20, 50]"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="loadReports"
            @current-change="loadReports"
          />
        </div>
      </el-tab-pane>
    </el-tabs>

    <el-dialog v-model="banDialog.visible" title="封禁用户" width="420px">
      <el-form :model="banDialog.form" label-width="90px">
        <el-form-item label="用户">
          <el-input :value="`${banDialog.target?.nickname || ''} (${banDialog.target?.email || ''})`" disabled />
        </el-form-item>
        <el-form-item label="封禁原因">
          <el-input v-model="banDialog.form.reason" type="textarea" :rows="3" placeholder="请输入封禁原因" />
        </el-form-item>
        <el-form-item label="截止时间">
          <el-date-picker
            v-model="banDialog.form.banUntil"
            type="datetime"
            placeholder="可不填（长期封禁）"
            value-format="YYYY-MM-DD HH:mm:ss"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="banDialog.visible = false">取消</el-button>
        <el-button type="danger" @click="submitBan">确认封禁</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="reportDialog.visible" title="处理举报" width="460px">
      <el-form :model="reportDialog.form" label-width="110px">
        <el-form-item label="处理状态">
          <el-select v-model="reportDialog.form.status" style="width: 100%">
            <el-option label="RESOLVED" value="RESOLVED" />
            <el-option label="REJECTED" value="REJECTED" />
          </el-select>
        </el-form-item>
        <el-form-item label="处理动作">
          <el-select v-model="reportDialog.form.action" style="width: 100%">
            <el-option label="NONE" value="NONE" />
            <el-option label="DELETE_POST" value="DELETE_POST" />
            <el-option label="DELETE_COMMENT" value="DELETE_COMMENT" />
            <el-option label="BAN_USER" value="BAN_USER" />
          </el-select>
        </el-form-item>
        <el-form-item label="处理说明">
          <el-input v-model="reportDialog.form.handledResult" type="textarea" :rows="3" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="reportDialog.visible = false">取消</el-button>
        <el-button type="primary" @click="submitHandleReport">提交处理</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { adminApi } from "@/api/admin";

const activeTab = ref("users");
const stats = ref({});

const loading = reactive({
  users: false,
  reports: false,
});

const userQuery = reactive({
  keyword: "",
  status: "",
  page: 1,
  size: 10,
});
const users = ref([]);
const userTotal = ref(0);

const reportQuery = reactive({
  status: "PENDING",
  page: 1,
  size: 10,
});
const reports = ref([]);
const reportTotal = ref(0);

const banDialog = reactive({
  visible: false,
  target: null,
  form: {
    reason: "",
    banUntil: "",
  },
});

const reportDialog = reactive({
  visible: false,
  target: null,
  form: {
    status: "RESOLVED",
    action: "NONE",
    handledResult: "",
  },
});

const statusTagType = (status) => {
  if (status === "PENDING") return "warning";
  if (status === "RESOLVED") return "success";
  if (status === "REJECTED") return "danger";
  return "info";
};

const loadStats = async () => {
  const res = await adminApi.getDashboardStats();
  stats.value = res.data || {};
};

const loadUsers = async () => {
  loading.users = true;
  try {
    const res = await adminApi.getUsers({
      keyword: userQuery.keyword || undefined,
      status: userQuery.status || undefined,
      page: userQuery.page,
      size: userQuery.size,
    });
    users.value = res.data?.records || [];
    userTotal.value = res.data?.total || 0;
  } finally {
    loading.users = false;
  }
};

const loadReports = async () => {
  loading.reports = true;
  try {
    const res = await adminApi.getReports({
      status: reportQuery.status || undefined,
      page: reportQuery.page,
      size: reportQuery.size,
    });
    reports.value = res.data?.records || [];
    reportTotal.value = res.data?.total || 0;
  } finally {
    loading.reports = false;
  }
};

const openBanDialog = (row) => {
  banDialog.target = row;
  banDialog.form.reason = "";
  banDialog.form.banUntil = "";
  banDialog.visible = true;
};

const submitBan = async () => {
  if (!banDialog.form.reason?.trim()) {
    ElMessage.warning("请填写封禁原因");
    return;
  }
  await adminApi.banUser(banDialog.target.id, {
    reason: banDialog.form.reason.trim(),
    banUntil: banDialog.form.banUntil || null,
  });
  ElMessage.success("封禁成功");
  banDialog.visible = false;
  await Promise.all([loadUsers(), loadStats()]);
};

const handleUnban = async (row) => {
  await ElMessageBox.confirm(`确定解封用户 ${row.nickname || row.email} ?`, "提示", {
    type: "warning",
  });
  await adminApi.unbanUser(row.id);
  ElMessage.success("解封成功");
  await Promise.all([loadUsers(), loadStats()]);
};

const openReportDialog = (row) => {
  reportDialog.target = row;
  reportDialog.form.status = "RESOLVED";
  reportDialog.form.action = "NONE";
  reportDialog.form.handledResult = "";
  reportDialog.visible = true;
};

const submitHandleReport = async () => {
  await adminApi.handleReport(reportDialog.target.id, {
    status: reportDialog.form.status,
    action: reportDialog.form.action,
    handledResult: reportDialog.form.handledResult || "",
  });
  ElMessage.success("处理完成");
  reportDialog.visible = false;
  await Promise.all([loadReports(), loadStats()]);
};

onMounted(async () => {
  await Promise.all([loadStats(), loadUsers(), loadReports()]);
});
</script>

<style scoped>
.admin-page {
  padding: 8px;
}

.page-header h2 {
  margin: 0;
  font-size: 24px;
}

.page-header p {
  margin: 8px 0 16px;
  color: #666;
}

.stats-row {
  margin-bottom: 16px;
}

.stat-card {
  text-align: center;
}

.stat-card .k {
  font-size: 24px;
  font-weight: 700;
}

.stat-card .v {
  font-size: 13px;
  color: #777;
}

.toolbar {
  display: flex;
  gap: 10px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}

.pager {
  margin-top: 12px;
  display: flex;
  justify-content: flex-end;
}

.muted {
  color: #909399;
}
</style>
