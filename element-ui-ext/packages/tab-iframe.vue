<template>
    <el-tabs ref="tabs" type="card" v-model="tabName"
             v-bind="[$attrs]"
             class="iframe-tab"
             @tab-click="tab_change"
             @tab-remove="tab_remove"
             :before-leave="tab_leave"
             v-if="list.length"
    >
        <el-tab-pane v-for="tab in list" :name="tab.name" :label="tab.name + ' '"
                     :key="tab.path" :closable="tab.name != homeName">
            <iframe frameborder="no" :src="tab.path_com"
                    v-if="tabName == tab.name || loadedTabs.includes(tab.name)"
                    style="flex: 1;display: flex;flex-direction: column;"
            ></iframe>
        </el-tab-pane>
    </el-tabs>
</template>

<script>

//$router.push ，刷新URL，不刷新页面。

jv.getIframeUrl = function (path) {
    var json = jv.query2Json(BASE_URL.slice(0, -1) + path);
    json["_com_"] = true;
    return jv.param(json, true);
}
jv.exit_fullscreen = function () {
    var iframe = document.querySelector("iframe.fullscreen");
    if (iframe) {
        iframe.classList.remove("fullscreen");
        document.body.classList.remove("fullscreen")
    }

    top.document.body.classList.remove("fullscreen")
    if (window.frameElement) {
        window.frameElement.classList.remove("fullscreen");
    }
}

class TabItemData {
    name = ""
    root = ""
    path = ""

    constructor(name, root, path) {
        this.name = name;
        this.root = root;
        this.path = path || root;
    }

    get root_com() {
        return jv.getIframeUrl(this.root);
    }

    get path_com() {
        return jv.getIframeUrl(this.path);
    }
}

export default {
    name: "tab-iframe",
    data() {
        return {
            loadedTabs: [],
            tabName: "",
            list: [],
        };
    },
    props: {
        value: {
            type: String, default: () => null
        },
        homeName: {type: String, default: () => "首页"},
        homePath: {type: String, default: () => "/"},
        routeMetaKey: {type: String, default: () => "tab"}
    },
    watch: {
        "$route": {
            immediate: true, deep: true, handler() {
                this.init();
            }
        },
        value: {
            deep: true,
            immediate: true,
            handler(val) {
                if (val === null) {
                    return;
                }
                this.tabName = val;
            }
        },
        tabName(v) {
            if (v === null) {
                return;
            }
            this.$emit("input", v);
        }
    },
    created() {
        jv.tabIframe = this;
    },
    methods: {
        closeTab(tabName) {
            this.list = this.list.removeItem(it => it.name == tabName);
            this.saveList(this.list);
        },
        closeOther(tabName) {
            this.list = this.list.removeItem(it => it.name != tabName && it.name != this.homeName);
            this.saveList(this.list);
        },
        activeTab(tabName) {
            this.tabName = tabName;
        },
        reloadTab(tabName) {
            this.activeTab(tabName);
            var index = this.list.map(it => it.name).indexOf(tabName);
            var content = this.$refs.tabs.$el.querySelector(".el-tabs__content");
            var content_iframe = content.children[index].children[0];
            content_iframe.src = content_iframe.src;
        },
        fullscreen(tabName) {
            this.activeTab(tabName);
            var ori_full = document.querySelector("iframe.fullscreen");
            if (ori_full) {
                ori_full.classList.remove("fullscreen");
            }
            var index = this.list.map(it => it.name).indexOf(tabName);
            var content = this.$refs.tabs.$el.querySelector(".el-tabs__content");
            var content_iframe = content.children[index].children[0];
            content_iframe.classList.add("fullscreen");
            document.body.classList.add("fullscreen");

            var full_div = document.body.querySelector(".fullscreen-div");
            if (!full_div) {
                document.addEventListener("keydown", (e) => {
                    if (e.key == "F4") {
                        jv.exit_fullscreen();
                    }
                })

                full_div = document.createElement("div");
                document.body.appendChild(full_div);
                full_div.addEventListener("click", jv.exit_fullscreen)
                full_div.classList.add("fullscreen-div")
            }
            full_div.style.animation = "loading 1s"
        },
        toHomeTab(tabName) {
            this.activeTab(tabName)
            var tab = this.list.filter(it => it.name == tabName)[0];
            tab.path = tab.root;
            this.$nextTick(() => {
                this.saveList(this.list);
            });
        },
        init() {
            var tabs = localStorage.getJson(jv.tabs_key);
            if (!tabs) {
                tabs = [new TabItemData(this.homeName, this.homePath)]
            }

            var tabName = this.$route.meta[this.routeMetaKey] || this.homeName;
            this.setTab(tabName, this.$route.path);
        },
        setTab(tabName, path) {
            var tabs = localStorage.getJson(jv.tabs_key);
            if (!tabs) {
                tabs = [new TabItemData(this.homeName, this.homePath)]
            } else {
                tabs = tabs.map(it => new TabItemData(it.name, it.root, it.path));
            }

            if (!this.loadedTabs.includes(tabName)) {
                this.loadedTabs.push(tabName);
            }

            this.activeTab(tabName);
            var last = tabs.last(it => it.name == tabName);

            if (last) {
                last.path = path;
            } else {
                tabs.push(new TabItemData(tabName, path));
            }
            this.saveList(tabs);
        },
        saveList(tabs) {
            localStorage.setJson(jv.tabs_key, tabs);
            this.list = tabs;
        },
        tab_leave(tab, oldActiveName) {
            if (!this.loadedTabs.includes(tab)) {
                this.loadedTabs.push(tab);
            }

            var item = this.list.last(it => it.name == tab);
            if (!item) {
                return;
            }
            top.history.pushState('', '', BASE_URL.slice(0, -1) + item.path);
        },
        tab_change(tab, ev) {

        },
        tab_remove(tab) {
            var tabs = this.list;
            if (!tabs.length) {
                return;
            }

            tabs = tabs.removeItem(it => it.name == tab);
            this.saveList(tabs);
            this.loadedTabs.removeItem(tab);

            if (tab == this.tabName && tabs.length) {
                this.activeTab(tabs.last().name);
            }
        }
    }
}
</script>
<style lang="scss">

/deep/ .el-tabs__item .el-icon-close {
    margin-right: -10px;
    margin-left: 10px;
}
.iframe-tab{
    flex: 1;
    display: flex;
    flex-direction: column;
}

.iframe-tab /deep/ .el-tabs__content {
    flex: 1;
    display: flex;
    flex-direction: column;
    padding: 0;
}

/deep/ .el-tab-pane {
    flex: 1;
    display: flex;
    flex-direction: column;
}
</style>
