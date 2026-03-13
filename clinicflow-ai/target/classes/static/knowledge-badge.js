// shared: knowledge sidebar aggregate notification badge
(function () {
  function readArray(key) {
    try {
      const v = JSON.parse(localStorage.getItem(key) || "[]");
      return Array.isArray(v) ? v : [];
    } catch (_) {
      return [];
    }
  }

  function getTotal() {
    const faqRaw = readArray("clinicflow_faq_items_v1");
    const tplRaw = readArray("clinicflow_reply_templates_v1");
    const apvRaw = readArray("clinicflow_approvals_v1");

    const faq = faqRaw.filter(function (i) {
      return i && i.status === "needs_review";
    }).length;
    const tpl = tplRaw.filter(function (i) {
      return i && i.status === "needs_review";
    }).length;
    let apv = apvRaw.filter(function (i) {
      return i && (i.status === "承認待ち" || i.status === "承認中");
    }).length;
    // fallback: approvals data is not created until approvals/knowledge pages are opened.
    // Show the default pending badge count used by the sidebar mock.
    if (!apvRaw.length) apv = 2;
    const byStorage = faq + tpl + apv;
    if (byStorage > 0) return byStorage;
    // fallback: use existing sub-menu badges when localStorage is not initialized yet
    const subBadges = Array.prototype.slice.call(document.querySelectorAll(".sidebar-sub .sidebar-item-badge, .sub .badge, .sub .sidebar-item-badge"));
    let sum = 0;
    subBadges.forEach(function (b) {
      const n = parseInt((b.textContent || "").trim(), 10);
      if (!isNaN(n)) sum += n;
    });
    return sum;
  }

  function findKnowledgeLinks() {
    // Only target top-level "ナレッジ管理" menu link.
    // Do not add badges to sub links: FAQ編集 / 回答テンプレート / 承認フロー.
    const links = Array.prototype.slice.call(
      document.querySelectorAll('.sidebar-nav > a[href="/knowledge.html"], .nav > a[href="/knowledge.html"]')
    );
    return links;
  }

  function render() {
    const total = getTotal();
    const targets = findKnowledgeLinks();
    if (!targets.length) return;

    // Remove previously injected badges from sub-links to avoid duplicate display.
    Array.prototype.slice.call(document.querySelectorAll(".sub .knowledge-notice-badge, .sidebar-sub .knowledge-notice-badge"))
      .forEach(function (el) { el.remove(); });

    targets.forEach(function (link) {
      const old = link.querySelector(".knowledge-notice-badge");
      if (old) old.remove();
      if (total <= 0) return;
      const b = document.createElement("span");
      b.className = "knowledge-notice-badge";
      b.textContent = String(total);
      b.style.cssText =
        "margin-left:auto;min-width:18px;height:18px;padding:0 6px;border-radius:20px;display:inline-flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;background:#dc3545;color:#fff;";
      link.appendChild(b);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", render);
  } else {
    render();
  }
  window.addEventListener("load", render);
  window.addEventListener("storage", render);
})();
