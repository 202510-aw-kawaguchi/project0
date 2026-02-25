// shared: staff settings model + sidebar rendering + assignee helpers
(function () {
  const STAFF_KEY = "staffMembers";
  const CURRENT_KEY = "currentStaffId";
  const DEFAULT_STAFF = [
    { id: "st-001", name: "佐藤", role: "サポート管理者", color: "#17a2b8", active: true },
    { id: "st-002", name: "鈴木", role: "受付", color: "#20c997", active: true },
    { id: "st-003", name: "田中", role: "看護師", color: "#6f42c1", active: true },
  ];

  function clone(v) {
    return JSON.parse(JSON.stringify(v));
  }

  function sanitizeMember(member, index) {
    const id = String(member && member.id ? member.id : "st-" + String(index + 1).padStart(3, "0"));
    const name = String(member && member.name ? member.name : "担当者" + (index + 1));
    const role = String(member && member.role ? member.role : "スタッフ");
    const color = String(member && member.color ? member.color : "#17a2b8");
    const active = member && typeof member.active === "boolean" ? member.active : true;
    return { id, name, role, color, active };
  }

  function saveRaw(members, currentId) {
    localStorage.setItem(STAFF_KEY, JSON.stringify(members));
    localStorage.setItem(CURRENT_KEY, currentId);
  }

  function ensure() {
    let members;
    let currentId = localStorage.getItem(CURRENT_KEY);
    try {
      members = JSON.parse(localStorage.getItem(STAFF_KEY) || "null");
    } catch (_) {
      members = null;
    }

    if (!Array.isArray(members) || members.length === 0) {
      const defaults = clone(DEFAULT_STAFF);
      saveRaw(defaults, defaults[0].id);
      return { members: defaults, currentId: defaults[0].id };
    }

    members = members.map((m, i) => sanitizeMember(m, i));
    if (!currentId || !members.some((m) => m.id === currentId)) {
      currentId = (members.find((m) => m.active) || members[0]).id;
    }
    saveRaw(members, currentId);
    return { members, currentId };
  }

  function loadSettings() {
    return ensure();
  }

  function saveSettings(members, currentId) {
    const normalized = (Array.isArray(members) ? members : []).map((m, i) => sanitizeMember(m, i));
    if (!normalized.length) return;
    const safeCurrent = normalized.some((m) => m.id === currentId)
      ? currentId
      : (normalized.find((m) => m.active) || normalized[0]).id;
    saveRaw(normalized, safeCurrent);
    // updated: notify other pages/components that staff settings changed
    document.dispatchEvent(new CustomEvent("clinicflow:staff-updated"));
  }

  function getCurrentStaff(data) {
    const d = data || ensure();
    return d.members.find((m) => m.id === d.currentId) || d.members[0];
  }

  function getActiveMembers(data) {
    const d = data || ensure();
    return d.members.filter((m) => m.active);
  }

  function getStaffById(id, data) {
    const d = data || ensure();
    return d.members.find((m) => m.id === id) || null;
  }

  function mapNameToId(name, data) {
    const d = data || ensure();
    if (!name) return "";
    const hit = d.members.find((m) => m.name === name);
    return hit ? hit.id : "";
  }

  function normalizeStaffId(value, data) {
    if (!value) return "";
    const d = data || ensure();
    if (d.members.some((m) => m.id === value)) return value;
    return mapNameToId(value, d);
  }

  function getStaffName(id, data) {
    if (!id) return "未割当";
    const s = getStaffById(id, data);
    return s ? s.name : "未割当";
  }

  function firstChar(name) {
    return (name || "?").trim().charAt(0) || "?";
  }

  function renderSidebarUser(root) {
    const base = root || document;
    const d = ensure();
    const current = getCurrentStaff(d);

    let nameEl = base.querySelector("#sidebarUserName");
    let roleEl = base.querySelector("#sidebarUserRole");
    let avatarEl = base.querySelector("#sidebarUserAvatar");

    let sidebarUser = base.querySelector(".sidebar-user");
    if (!nameEl || !roleEl || !avatarEl) {
      if (sidebarUser) {
        avatarEl = avatarEl || sidebarUser.querySelector(".avatar");
        const userNameClass = sidebarUser.querySelector(".user-name");
        const userRoleClass = sidebarUser.querySelector(".user-role");
        if (userNameClass && userRoleClass) {
          nameEl = nameEl || userNameClass;
          roleEl = roleEl || userRoleClass;
        } else {
          // Prefer the text wrapper next to avatar to avoid picking wrong nested nodes.
          const infoWrap = avatarEl && avatarEl.nextElementSibling ? avatarEl.nextElementSibling : null;
          if (infoWrap) {
            const infoLines = Array.prototype.slice.call(infoWrap.children);
            if (infoLines.length >= 1) nameEl = nameEl || infoLines[0];
            if (infoLines.length >= 2) roleEl = roleEl || infoLines[1];
          }
          // Fallback for irregular markup.
          if (!nameEl || !roleEl) {
            const textNodes = sidebarUser.querySelectorAll("div > div");
            if (textNodes.length >= 2) {
              nameEl = nameEl || textNodes[0];
              roleEl = roleEl || textNodes[1];
            }
          }
        }
      }
    }

    // Ensure both lines exist even in minimal markup pages.
    if (sidebarUser && (!nameEl || !roleEl)) {
      let infoWrap = avatarEl && avatarEl.nextElementSibling ? avatarEl.nextElementSibling : null;
      if (!infoWrap) {
        infoWrap = document.createElement("div");
        sidebarUser.appendChild(infoWrap);
      }
      if (!nameEl) {
        nameEl = document.createElement("div");
        infoWrap.appendChild(nameEl);
      }
      if (!roleEl) {
        roleEl = document.createElement("div");
        roleEl.style.fontSize = "11px";
        roleEl.style.color = "#6c757d";
        infoWrap.appendChild(roleEl);
      }
    }

    if (nameEl) nameEl.textContent = "受付担当：" + current.name;
    if (roleEl) roleEl.textContent = current.role;
    if (avatarEl) {
      avatarEl.textContent = firstChar(current.name);
      avatarEl.style.background = current.color;
    }

    const headerAvatar = base.querySelector(".header-avatar");
    if (headerAvatar) {
      headerAvatar.textContent = firstChar(current.name);
      headerAvatar.style.background = current.color;
      headerAvatar.title = current.name;
    }

    // updated: make sidebar user clickable to open staff management
    if (sidebarUser && !sidebarUser.dataset.staffLinkBound) {
      sidebarUser.dataset.staffLinkBound = "1";
      sidebarUser.style.cursor = "pointer";
      sidebarUser.title = "担当者を変更";
      sidebarUser.addEventListener("click", function () {
        openStaffPicker();
      });
    }
  }

  function ensurePicker() {
    let modal = document.getElementById("staffPickerModal");
    if (modal) return modal;
    modal = document.createElement("div");
    modal.id = "staffPickerModal";
    modal.style.cssText = "display:none;position:fixed;inset:0;background:rgba(0,0,0,.45);z-index:9999;align-items:center;justify-content:center;padding:16px;";
    modal.innerHTML =
      '<div style="width:min(420px,100%);background:#fff;border-radius:12px;box-shadow:0 10px 30px rgba(0,0,0,.25);padding:16px;">' +
      '<div style="font-weight:700;font-size:16px;margin-bottom:10px;">受付担当を変更</div>' +
      '<div style="font-size:12px;color:#6c7683;margin-bottom:8px;">有効な担当者から選択できます</div>' +
      '<select id="staffPickerSelect" style="width:100%;padding:10px;border:1px solid #d2dae3;border-radius:8px;"></select>' +
      '<div style="display:flex;gap:8px;justify-content:flex-end;margin-top:12px;">' +
      '<button id="staffPickerManageBtn" type="button" style="border:1px solid #d2dae3;background:#fff;border-radius:8px;padding:8px 10px;cursor:pointer;">担当者管理へ</button>' +
      '<button id="staffPickerCancelBtn" type="button" style="border:1px solid #d2dae3;background:#fff;border-radius:8px;padding:8px 10px;cursor:pointer;">キャンセル</button>' +
      '<button id="staffPickerSaveBtn" type="button" style="border:1px solid #17a2b8;background:#17a2b8;color:#fff;border-radius:8px;padding:8px 10px;cursor:pointer;">変更</button>' +
      "</div></div>";
    document.body.appendChild(modal);

    modal.addEventListener("click", function (e) {
      if (e.target === modal) closeStaffPicker();
    });
    modal.querySelector("#staffPickerCancelBtn").addEventListener("click", closeStaffPicker);
    modal.querySelector("#staffPickerManageBtn").addEventListener("click", function () {
      closeStaffPicker();
      openStaffSettings();
    });
    modal.querySelector("#staffPickerSaveBtn").addEventListener("click", function () {
      const d = ensure();
      const sel = modal.querySelector("#staffPickerSelect");
      const nextId = sel ? sel.value : "";
      if (!nextId) return;
      saveRaw(d.members, nextId);
      renderSidebarUser(document);
      document.dispatchEvent(new CustomEvent("clinicflow:staff-updated"));
      closeStaffPicker();
    });
    return modal;
  }

  function openStaffPicker() {
    const d = ensure();
    const modal = ensurePicker();
    const select = modal.querySelector("#staffPickerSelect");
    const active = d.members.filter(function (m) { return m.active; });
    select.innerHTML = active
      .map(function (m) {
        return '<option value="' + m.id + '"' + (m.id === d.currentId ? " selected" : "") + ">" + m.name + "（" + m.role + "）</option>";
      })
      .join("");
    modal.style.display = "flex";
  }

  function closeStaffPicker() {
    const modal = document.getElementById("staffPickerModal");
    if (modal) modal.style.display = "none";
  }

  function openStaffSettings() {
    const path = window.location.pathname || "";
    if (path.endsWith("/settings.html") || path.endsWith("settings.html")) {
      window.location.hash = "#staff";
    } else {
      window.location.href = "/settings.html#staff";
    }
  }

  function buildStaffOptions(selectedId, data, includeUnassigned) {
    const d = data || ensure();
    const includeNone = includeUnassigned !== false;
    const active = getActiveMembers(d);
    let html = "";
    if (includeNone) {
      html += `<option value="" ${!selectedId ? "selected" : ""}>未割当</option>`;
    }
    html += active
      .map((m) => `<option value="${m.id}" ${selectedId === m.id ? "selected" : ""}>${m.name}</option>`)
      .join("");
    return html;
  }

  function fillStaffSelect(selectEl, selectedId, includeUnassigned) {
    if (!selectEl) return;
    selectEl.innerHTML = buildStaffOptions(selectedId, null, includeUnassigned);
  }

  function ensureHeaderDropdownStyle() {
    if (document.getElementById("cfHeaderDropdownStyle")) return;
    var style = document.createElement("style");
    style.id = "cfHeaderDropdownStyle";
    style.textContent =
      ".header-right{position:relative}" +
      ".dropdown-panel{position:absolute;top:60px;right:20px;width:300px;background:#fff;border-radius:8px;box-shadow:0 8px 24px rgba(0,0,0,.12);padding:16px;z-index:200;display:none;border:1px solid #e7edf3}" +
      ".dropdown-panel.active{display:block}" +
      ".dropdown-title{margin:0 0 10px;font-size:14px;font-weight:700}" +
      ".dropdown-input{width:100%;border:1px solid #d7dee6;border-radius:8px;padding:8px 10px;font-size:13px;outline:none}" +
      ".dropdown-list{display:grid;gap:8px}.dropdown-item{padding:8px 10px;background:#f8fafc;border-radius:8px;font-size:13px}" +
      ".dropdown-foot{margin-top:10px;font-size:12px}.dropdown-foot a{color:#17a2b8;text-decoration:none}" +
      ".dropdown-btn{border:1px solid #d7dee6;border-radius:8px;background:#fff;padding:7px 10px;cursor:pointer}" +
      "@media(max-width:992px){.dropdown-panel{right:10px;left:10px;width:auto}}";
    document.head.appendChild(style);
  }

  function findHeaderIconButton(iconName) {
    var icons = document.querySelectorAll(".header-right .header-btn .material-icons");
    for (var i = 0; i < icons.length; i++) {
      var text = (icons[i].textContent || "").trim();
      if (text === iconName) return icons[i].closest(".header-btn");
    }
    return null;
  }

  function initHeaderDropdowns() {
    // skip pages that already have page-specific implementation
    if (document.getElementById("mailBtn") && document.getElementById("notifyBtn")) return;
    var right = document.querySelector(".header-right");
    if (!right) return;

    var searchBtn = findHeaderIconButton("search");
    var mailBtn = findHeaderIconButton("mail");
    var notifyBtn = findHeaderIconButton("notifications");
    if (!mailBtn && !notifyBtn && !searchBtn) return;
    if (right.dataset.dropdownBound === "1") return;
    right.dataset.dropdownBound = "1";

    ensureHeaderDropdownStyle();

    function ensurePanel(id, html) {
      var panel = document.getElementById(id);
      if (!panel) {
        panel = document.createElement("div");
        panel.id = id;
        panel.className = "dropdown-panel";
        panel.innerHTML = html;
        right.appendChild(panel);
      }
      panel.addEventListener("click", function (e) { e.stopPropagation(); });
      return panel;
    }

    var searchPanel = ensurePanel("searchDropdown", '<h4 class="dropdown-title">検索</h4><input id="headerSearchInput" class="dropdown-input" type="text" placeholder="顧客名・内容で検索">');
    var mailPanel = ensurePanel("mailDropdown", '<h4 class="dropdown-title">メール</h4><div class="dropdown-list"><a class="dropdown-item" href="/inbox.html?customer=%E5%B1%B1%E7%94%B0%E3%81%95%E3%81%BE" style="display:block;color:inherit;text-decoration:none;">山田さま：返信待ち</a><a class="dropdown-item" href="/inbox.html?customer=%E4%BD%90%E8%97%A4%E3%81%95%E3%81%BE" style="display:block;color:inherit;text-decoration:none;">佐藤さま：予約変更</a><a class="dropdown-item" href="/inbox.html?customer=%E9%88%B4%E6%9C%A8%E3%81%95%E3%81%BE" style="display:block;color:inherit;text-decoration:none;">鈴木さま：施術説明</a></div><div class="dropdown-foot"><a href="/inbox.html">すべて表示</a></div>');
    var notifyPanel = ensurePanel("notifyDropdown", '<h4 class="dropdown-title">通知</h4><div class="dropdown-list"><div class="dropdown-item">安全アラート発生</div><div class="dropdown-item">クレーム優先対応</div><div class="dropdown-item">仮受付完了</div></div><div class="dropdown-foot"><button class="dropdown-btn" id="markAllReadBtn" type="button">すべて既読にする</button></div>');

    var active = "";
    function closeAll() {
      searchPanel.classList.remove("active");
      mailPanel.classList.remove("active");
      notifyPanel.classList.remove("active");
      active = "";
    }
    function toggle(kind) {
      var map = { search: searchPanel, mail: mailPanel, notify: notifyPanel };
      var next = map[kind];
      if (!next) return;
      var isOpen = active === kind;
      closeAll();
      if (!isOpen) {
        next.classList.add("active");
        active = kind;
        if (kind === "search") {
          var input = document.getElementById("headerSearchInput");
          if (input) input.focus();
        }
      }
    }

    if (searchBtn) searchBtn.addEventListener("click", function (e) { e.stopPropagation(); toggle("search"); });
    if (mailBtn) mailBtn.addEventListener("click", function (e) { e.stopPropagation(); toggle("mail"); });
    if (notifyBtn) notifyBtn.addEventListener("click", function (e) { e.stopPropagation(); toggle("notify"); });

    document.addEventListener("click", closeAll);

    var inputEl = document.getElementById("headerSearchInput");
    if (inputEl) {
      inputEl.addEventListener("keydown", function (e) {
        if (e.key === "Enter") console.log("header search:", inputEl.value || "");
      });
    }
    var readBtn = document.getElementById("markAllReadBtn");
    if (readBtn) {
      readBtn.addEventListener("click", function () {
        console.log("notifications marked as read (demo)");
      });
    }
  }

  window.StaffSettings = {
    DEFAULT_STAFF,
    loadSettings,
    saveSettings,
    getCurrentStaff,
    getActiveMembers,
    getStaffById,
    getStaffName,
    mapNameToId,
    normalizeStaffId,
    renderSidebarUser,
    buildStaffOptions,
    fillStaffSelect,
  };

  // updated: execute once immediately and again on DOMContentLoaded
  renderSidebarUser(document);
  initHeaderDropdowns();
  document.addEventListener("DOMContentLoaded", function () {
    renderSidebarUser(document);
    initHeaderDropdowns();
  });
  // updated: fallback delegation so click works even if page markup differs
  document.addEventListener("click", function (e) {
    const target = e.target && e.target.closest ? e.target.closest(".sidebar-user") : null;
    if (!target) return;
    openStaffPicker();
  });
})();
