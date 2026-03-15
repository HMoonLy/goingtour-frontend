import { ElMessage, ElMessageBox, ElNotification } from "element-plus";

const MESSAGE_SHOWN_FLAG = "__goingtourMessageShown";

const normalizeMessageOptions = (input, type) => {
  if (typeof input === "object" && input !== null) {
    return {
      showClose: true,
      duration: 3000,
      ...input,
      type: input.type || type,
    };
  }

  return {
    message: input,
    type,
    showClose: true,
    duration: 3000,
  };
};

const normalizeNotificationOptions = (input, type) => {
  if (typeof input === "object" && input !== null) {
    return {
      showClose: true,
      duration: 4500,
      ...input,
      type: input.type || type,
    };
  }

  return {
    message: input,
    type,
    showClose: true,
    duration: 4500,
  };
};

const openMessage = (type, input) => ElMessage(normalizeMessageOptions(input, type));

const openNotification = (type, input) =>
  ElNotification(normalizeNotificationOptions(input, type));

const markErrorMessageShown = (error) => {
  if (error && (typeof error === "object" || typeof error === "function")) {
    error[MESSAGE_SHOWN_FLAG] = true;
  }
  return error;
};

const hasErrorMessageShown = (error) =>
  Boolean(
    error &&
      (error[MESSAGE_SHOWN_FLAG] ||
        error.__handled ||
        error.__messageShown ||
        error.alreadyNotified)
  );

const createHandledError = (message, extra = {}) => {
  const error = new Error(message);
  Object.assign(error, extra);
  return markErrorMessageShown(error);
};

export const notify = {
  success(input) {
    return openMessage("success", input);
  },
  warning(input) {
    return openMessage("warning", input);
  },
  info(input) {
    return openMessage("info", input);
  },
  error(input) {
    return openMessage("error", input);
  },
  notification(input) {
    return ElNotification({
      showClose: true,
      duration: 4500,
      ...input,
    });
  },
  successNotification(input) {
    return openNotification("success", input);
  },
  warningNotification(input) {
    return openNotification("warning", input);
  },
  infoNotification(input) {
    return openNotification("info", input);
  },
  errorNotification(input) {
    return openNotification("error", input);
  },
  loading(input) {
    return ElMessage({
      duration: 0,
      showClose: false,
      ...(typeof input === "object" && input !== null ? input : { message: input }),
      type: "info",
    });
  },
  closeAll() {
    ElMessage.closeAll();
  },
  confirm(message, title = "提示", options = {}) {
    return ElMessageBox.confirm(message, title, {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      ...options,
    });
  },
  prompt(message, title = "提示", options = {}) {
    return ElMessageBox.prompt(message, title, {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      ...options,
    });
  },
  alert(message, title = "提示", options = {}) {
    return ElMessageBox.alert(message, title, {
      confirmButtonText: "确定",
      ...options,
    });
  },
};

export { createHandledError, hasErrorMessageShown, markErrorMessageShown };

export default notify;
