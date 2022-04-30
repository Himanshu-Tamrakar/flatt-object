class VahanaTree {

    constructor (obj) {
        this.flattenId = 0;
        //target div id
        this.target = obj.vah_target;
        //building area
        this.area = '';
        //available nodes list
        this.nodeList = {};
        //row create callback
        this.rowCreateCallback = obj.rowCreateCallback;
        //draw callback
        this.drawCallback = obj.drawCallback;
        //switch callback
        this.switchCallback = obj.switchCallback;
        // node removed callback
        this.nodeRemove = obj.nodeRemoveCallback;
        //tree json data
        this.data = (obj.vah_config.flattenJSON) ? this.flattenJSON(obj.vah_json_data) : obj.vah_flatten_json;
        // this.unflattenJson = this.makeObj(this.data.flatten, {});
        this.drawElements = (obj.vah_config.drawElements) ? obj.vah_elements : {};
        //build tree
        this.build(obj.vah_config);
        //referance for some events
        this.main_container = document.getElementById(this.config.key + '_div_vahana_tree');
        //start events 
        this.staticEvents();
    }

    /**
    * this method will contains static events for tree
    */
    staticEvents() {
        //copyPath event
        if (this.config.copyPath) {
            this.main_container.addEventListener('click', e => {
                let elm = e.target;

                if (elm.classList.contains('copyPath')) {
                    /* Copy the text */
                    navigator.clipboard.writeText(e.target.parentNode.getAttribute('data-path'));
                    console.log(e.target.parentNode.getAttribute('data-path'));
                }
            });
        }
    }

    //#region Helper Methods
    /**
    * 
    */
    async destroy() {
        //remove all items
        document.getElementById(this.target).innerHTML = '';
    }


    /**
    * 
    * @param {string} message for log messages
    */
    log(message) {
        if (this.config.logMode) {
            console.log(message);
        }
    }

    /**
    * Building main details
    */
    build(vah_config) {
        //set default config
        this.config = {
            key: new Date().getTime(),
            //logs are open or close
            logMode: false,
            //switch mode
            switchMode: false,
            //family mode
            //for child
            autoChild: true,
            //for parent
            autoParent: true,
            //fold icon
            foldedIcon: 'icon icon-va-add',
            //unfold icon
            unFoldedIcon: 'icon icon-va-minus',
            //start status is collapsed or not
            foldedStatus: false,
            //allow copy option
            copyPath: false,
            // draw elements
            drawElements: true,
            dataPath: ""
        }
        //check config here!!
        for (let key in this.config) {
            if (vah_config[key] !== undefined) {
                this.config[key] = vah_config[key];
            }
        }
        //check if key is exist somewhere in document
        if (document.getElementById(this.config.key + '_div_vahana_tree') !== null) {
            this.config.key = new Date().getTime() + 10;
        }
        document.getElementById(this.target).innerHTML = '<div id="' + this.config.key + '_div_vahana_tree"><ul id="' + this.config.key + '_tree_vahana_main"></ul></div>';
        this.area = document.getElementById(this.config.key + '_tree_vahana_main');
        this.log('tree build started..');
        this.drawData();
    }


    getNode(id) {
        this.log('node returned..');
        //return node
        return this.nodeList[id];
    }

    /**
    * set child nodes for parent node
    */
    setChildNodes(node) {
        //update node parent
        for (let key in this.nodeList) {
            if (this.nodeList[key].id === node.parent.id) {
                this.nodeList[key].childs.push(node.id);
                //show icon for childs
                document.getElementById('i_' + this.nodeList[key].id).style.display = '';
            }
        }
    }

    /**
    * this method will return switched nodes
    */
    getSelected() {
        let nodes = [];
        //get all checked nodes
        for (let key in this.nodeList) {
            if (this.nodeList[key].checkStatus) nodes.push(this.nodeList[key]);
        }
        return nodes;
    }

    /**
    * this method will reset switched nodes
    */
    resetSelected() {
        //get all checked nodes
        for (let key in this.nodeList) {
            if (this.nodeList[key].checkStatus) {
                this.nodeList[key].checkStatus = false;
                this.checkNode(this.nodeList[key]);
            }
        }
        return true;
    }
    //#endregion




    //#region Node Events
    /**
    * get child nodes list of node
    */
    getChilds(node) {
        let list = [];
        for (let key in this.nodeList) {
            if (node.childs.includes(this.nodeList[key].id)) {
                list.push(this.nodeList[key]);
            }
        }
        this.log('node childs returned..');
        return list;
    }

    expandAllNodes() {
        for (let key in this.nodeList) {
            let ie = document.getElementById('i_' + this.nodeList[key].id);
            let ule = document.getElementById('c_' + this.nodeList[key].id);
            this.nodeList[key].foldedStatus = false;
            ie.classList.remove('icon-va-add');
            ie.classList.add('icon-va-minus');
            ule.style.display = '';
        }
    }

    collapseAllNodes() {
        for (let key in this.nodeList) {
            let ie = document.getElementById('i_' + this.nodeList[key].id);
            let ule = document.getElementById('c_' + this.nodeList[key].id);
            this.nodeList[key].foldedStatus = true;
            ie.classList.remove('icon-va-minus');
            ie.classList.add('icon-va-add');
            ule.style.display = 'none';
        }
    }

    /**
    * toggle open or close node childs
    */
    toggleNode(node) {
        console.log('node,', node);
        if (node.childs.length > 0) {
            let ie = document.getElementById('i_' + node.id);
            let ule = document.getElementById('c_' + node.id);
            if (node.foldedStatus === false) {
                console.log('if');
                //change icon
                ie.classList.remove('icon-va-minus');
                ie.classList.add('icon-va-add');
                //hide element
                ule.style.display = 'none';
            } else {
                console.log('else');
                //change icon
                ie.classList.remove('icon-va-add');
                ie.classList.add('icon-va-minus');
                //show element
                ule.style.display = '';
            }
            node.foldedStatus = !node.foldedStatus;
            //change node status
            console.log('befor', this.nodeList);
            for (let key in this.nodeList) {
                if (this.nodeList[key].id === node.id) {
                    this.nodeList[key].foldedStatus = node.foldedStatus;
                }
            }
            console.log('after', this.nodeList);
            this.log('node toggled..');
        } else {
            this.log('node not has childs...!');
        }
    }

    /**
    * remove node from dom 
    */
    deleteNode(node) {
        //remove node from old parent's child data !!!!

        let elm = document.getElementById(node.id);
        let childs = node.getChilds();
        if (childs.length > 0) {
            for (let i = 0; i < childs.length; i++) {
                this.deleteNode(childs[i]);
            }
        }
        if (elm !== null) elm.parentNode.removeChild(elm);
        this.log('node removed..(' + node.id + ')');
        if (this.nodeRemove !== undefined) this.nodeRemove(node);
    }

    /**
    * this method will check node and its family.
    */
    checkNode(node) {
        //console.log(node);
        //then if is checked and folded unfold and open childs
        let clength = node.childs.length;
        if (node.checkStatus && clength > 0) {
            //make element looks like is folded
            node.foldedStatus = true;
            this.toggleNode(node);
        }
        //trigger callback if exists
        if (typeof this.switchCallback == "function") this.switchCallback(node);
        //check html element if family mode is open
        document.getElementById('ck_' + node.id).checked = node.checkStatus;
    }

    /**
    * this method will check node childs and his parents if not checked.
    */
    checkNodeFamily(node) {
        let status = node.checkStatus;
        let parentCheck = async (node) => {
            //first check if has parent
            if (node.parent.id !== 0) {
                //get parent node
                node = node.parent;
                let trans = () => {
                    //change parent node status
                    node.checkStatus = status;
                    //check parent node
                    this.checkNode(node);
                    //then restart process
                    parentCheck(node);
                };
                //decide for uncheck
                if (!status) {
                    //if all childs is unchecked or child count is equal to 1
                    let valid = true;
                    let childs = node.getChilds();
                    for (let i = 0; i < childs.length; i++) {
                        if (childs[i].checkStatus) {
                            valid = false;
                        }
                    }
                    if (valid) trans();
                } else {
                    trans();
                }
            }
        }


        let childCheck = async (node) => {
            //first check main node
            this.checkNode(node);
            //then check childs if exist
            if (node.childs.length > 0) {
                //foreach child
                for (let i = 0; i < node.childs.length; i++) {
                    let c_node = this.getNode(node.childs[i].split('node_')[1]);
                    c_node.checkStatus = status;
                    //restart process
                    childCheck(c_node);
                }
            }
        }
        if (this.config.autoChild) childCheck(node);
        if (this.config.autoParent) parentCheck(node);
    }

    /**
    * this method will unfold all parents of node 
    */
    async showFamily(node) {
        //check if has parent
        if (node.parent.id !== 0) {
            //then make node status closed
            node.parent.foldedStatus = true;
            //after send parent node for toggle
            this.toggleNode(node.parent);
            //make recursive for another parents
            this.showFamily(node.parent);
        }

    }
    //#endregion


    //#region Node Creator

    /**
    * creating node
    */
    createNode(obj) {
        let id = Date.now();
        let node = {
            //node value
            value: id,
            //node id
            id: this.target + 'node_' + obj['id'],
            //node title
            // title: 'untitled ' + id,
            title: obj['title'],
            path: obj['path'],
            parentid: obj['parentid'],
            dataType: obj['dataType'],
            //node html elements
            elements: [],
            //node parent element
            parent: {id: 0},
            // child element ids
            childs: [],
            //addional info
            addional: {},
            //childs status (child list opened or not)
            foldedStatus: this.config.foldedStatus,
            //check status for node
            checkStatus: false,
            //this method will return child nodes
            gestChilds: () => this.getChilds(node),
            //this method will remove node from dom
            // deleteNode: () => this.deleteNode(node),
            //this method will update node
            updateNode: () => this.updateNode(node),
            //this method will toggle node
            toggleNode: () => this.toggleNode(node),
            //this method will show node location
            showFamily: () => this.showFamily(node),
            //check node
            toggleCheck: (status) => {
                node.checkStatus = status;
                this.checkNode(node);
            }
        }

        //check setted values here!!
        for (let key in obj) {
            // console.log(key, obj[key]);
            if (obj[key] !== undefined) node[key.split('_')[1]] = obj[key];
            else if (key === 'id') node['id'] = this.target + 'node_' + obj['id'];
            else if (key === 'child' && obj[key] !== undefined) {
                console.log('inside if')
                node['haschildren'] = true;
            }
        }

        //node is added to container
        this.nodeList[obj['id']] = node;
        //node is drawed
        this.drawNode(node);
        //logged
        this.log('Node is created (' + node.id + ')');
        //node is returned
        return node;
    }

    /**
    * this method will update node
    * !! id is recommended
    */
    updateNode(node) {
        //first remove old node
        //console.log(this.getNode(node.id.split('_')[1]))
        this.getNode(node.id.split('node_')[1]).deleteNode();
        //clear old parent's childs if old parent info is exist
        if (node.old_parent !== undefined && node.old_parent.id !== 0) {
            this.nodeList[node.old_parent.value].childs = this.nodeList[node.old_parent.value].childs.filter(x => {
                return x !== node.id;
            });
            //if child count is 0 then remove minus icon
            if (this.nodeList[node.old_parent.value].childs.length === 0) {
                document.getElementById('i_' + node.old_parent.id).style.display = 'none';
            }
        }
        //draw new node with childs
        let set = (data) => {
            this.drawNode(data);
            let childs = data.getChilds();
            if (childs.length > 0) {
                for (let i = 0; i < childs.length; i++) {
                    set(childs[i]);
                }

            }
        }
        set(node);

        //log
        this.log('Node is created (' + node.id + ')');
        //return node
        return node;
    }


    /**
    * 
    * @param {object} node object for creating html element
    */
    drawNode(node) {
        let icon = this.config.unFoldedIcon;
        let style = '';
        if (node.foldedStatus) {
            icon = this.config.foldedIcon;
            style = 'none';
        }

        //node li item
        let li_item = document.createElement("li");
        //node a item
        let a_item = document.createElement("a");
        //node i item
        let i_item = document.createElement("i");
        //node span item
        let span_item = document.createElement("span");
        //node ul item
        let ul_item = document.createElement("ul");
        //node group item 
        let div_item = document.createElement("div");

        span_item.classList.add(node.dataType);

        //set i item id
        i_item.id = 'i_' + node.id;
        //set i item style
        i_item.style.color = 'black';
        //set i item icon
        icon = icon.split(' ');
        for (let i = 0; i < icon.length; i++) {
            i_item.classList.add(icon[i]);
        }
        i_item.style.display = 'none';

        //set ul item id
        ul_item.id = 'c_' + node.id;
        //set ul item style
        ul_item.style.display = style;

        //set a item id
        a_item.id = 'a_toggle_' + node.id;
        //set i tag to a item
        a_item.appendChild(i_item);
        //set span tag to a item
        a_item.appendChild(span_item);
        //set a item href
        a_item.href = 'javascript:;';
        //set a_item title
        a_item.innerHTML += ' ' + node.title;

        //set li item id
        li_item.id = node.id;

        div_item.id = 'div_g_' + node.id;
        div_item.setAttribute('data-path', node.path);
        //set a tag to div item
        div_item.appendChild(a_item);


        //set switch to li item if user is wanted
        if (this.config.switchMode) {
            let sw_item = document.createElement('label');
            let ck_item = document.createElement('input');
            let spn_item = document.createElement('span');

            spn_item.classList.add('slider');
            spn_item.classList.add('round');
            ck_item.type = 'checkbox'
            sw_item.classList.add('switch');

            sw_item.appendChild(ck_item);
            sw_item.appendChild(spn_item);

            //id definitions
            ck_item.id = 'ck_' + node.id;
            sw_item.id = 'sw_' + node.id;

            ck_item.value = node.value;
            //if item created as checked
            ck_item.checked = node.checkStatus;
            //switch is added to li element

            div_item.appendChild(sw_item);
        }

        //if draw elements 
        if (this.config.drawElements) {

            //element div wrapper
            let elementDiv_item = document.createElement("div");
            elementDiv_item.id = 'div_ele_' + node.id;

            for (let i = 0; i < this.drawElements.length; i++) {
                let element = this.drawElements[i];
                if (['string', 'number', 'boolean'].includes(node.dataType)) {

                    switch (element.type) {
                        case 'input': let select_ele = document.createElement("input");
                            select_ele.type = 'text'
                            select_ele.id = element.key + '_' + node.id;
                            let defaultSelected = this.data.flatten.find(ele => ele.path == node.path);
                            select_ele.value = defaultSelected.value;
                            // select_ele.onchange = this.selectFunction(element);
                            if (element.displayLabel) {
                                let select_label = document.createElement("label");
                                select_label.id = 'lb_' + element.key + '_' + node.id;

                                select_label.setAttribute('for', 'lb_' + element.key + '_' + node.id);
                                select_label.innerText = element.label;

                                elementDiv_item.appendChild(select_label);

                                select_label.setAttribute('for', 'lb_' + element.key + '_' + node.id);
                            }

                            for (let k = 0; k < element.value.length; k++) {
                                let el = document.createElement("option");
                                if (node.dataType == element.value[k]) {
                                    el.setAttribute('selected', true);
                                }
                                el.textContent = element.value[k];
                                el.value = element.value[k];
                                let defaultSelected = this.data.flatten.find(ele => ele.path == node.path);
                                if (defaultSelected[this.config['dataPath']]) {
                                    if (element.value[k] == defaultSelected[this.config['dataPath']]) {
                                        el.selected = true;
                                    }
                                }
                                select_ele.appendChild(el);
                            }
                            elementDiv_item.appendChild(select_ele);
                            // this.setCustomElementEvents(select_ele);
                            select_ele.onchange = (e, element) => {
                                let value = e.target.value;
                                this.data.flatten.forEach((ele) => {
                                    if (ele.title == node.title) {
                                        ele[this.config['dataPath']] = value;
                                        ele[this.config['value']] = value;
                                    }
                                });
                            }
                            break;
                        default: break;
                    }
                }

                div_item.appendChild(elementDiv_item);
            }
        }

        // copyPath
        if (this.config.copyPath) {
            let copyPathIcon = 'icon-va-copy copyPath';
            let i_item = document.createElement("i");

            //set i item id
            i_item.id = 'i_' + node.id;
            //set i item style
            i_item.style.color = 'black';
            //set i item icon
            copyPathIcon = copyPathIcon.split(' ');
            for (let i = 0; i < copyPathIcon.length; i++) {
                i_item.classList.add(copyPathIcon[i]);
            }

            div_item.appendChild(i_item);
        }

        li_item.appendChild(div_item);
        //set ul tag to li item
        li_item.appendChild(ul_item);

        //#endregion

        //if is main node
        //check if element is exist for preventing copy elements
        if (node.parent.id === 0) {
            //put item to area
            this.area.appendChild(li_item);
        } else {

            //if has parent set to parents childs
            this.setChildNodes(node);
            //then put item
            document.getElementById('c_' + node.parent.id).appendChild(li_item)
        }


        //set node events
        this.setNodeEvents(node);

        //draw callback method
        if (typeof this.rowCreateCallback == "function") this.rowCreateCallback(node);
    }

    setNodeEvents(node) {
        //toggle event for node
        document.getElementById('a_toggle_' + node.id).addEventListener('click', e => {
            //toggle item childs
            this.toggleNode(this.getNode(e.currentTarget.id.split('node_')[1]));
        });

        //switch event for node
        if (this.config.switchMode) {
            document.getElementById('ck_' + node.id).addEventListener('click', e => {
                let node = this.getNode(e.currentTarget.id.split('node_')[1]);
                console.log(node);
                node.checkStatus = e.currentTarget.checked;

                if (this.config.autoChild || this.config.autoParent) {
                    this.checkNodeFamily(node);
                }
                this.checkNode(node);
            });
        }
    }

    setCustomElementEvents(node) {
        if (node.id) {
            document.getElementById(node.id).addEventListener('click', e => {
                //toggle item childs
                console.log(e);
            });
        }
    }


    // Convert array to tree format 
    arrayToTree(items, config) {
        var __assign = (this && this.__assign) || function () {
            __assign = Object.assign || function (t) {
                for (var s, i = 1, n = arguments.length; i < n; i++) {
                    s = arguments[i];
                    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                        t[p] = s[p];
                }
                return t;
            };
            return __assign.apply(this, arguments);
        };

        var defaultConfig = {
            id: "id",
            parentId: "parentid",
            dataField: "data",
            childrenField: "Child",
            throwIfOrphans: false,
            rootParentIds: {"": true},
            nestedIds: true,
        };

        var _a, _b, _c;
        if (config === void 0) {config = {};}
        var conf = __assign(__assign({}, defaultConfig), config);
        // the resulting unflattened tree
        var rootItems = [];
        // stores all already processed items with their ids as key so we can easily look them up
        var lookup = {};
        // stores all item ids that have not been added to the resulting unflattened tree yet
        // this is an opt-in property, since it has a slight runtime overhead
        var orphanIds = config.throwIfOrphans
            ? new Set()
            : null;
        // idea of this loop:
        // whenever an item has a parent, but the parent is not yet in the lookup object, we store a preliminary parent
        // in the lookup object and fill it with the data of the parent later
        // if an item has no parentId, add it as a root element to rootItems
        for (var _i = 0, items_1 = items; _i < items_1.length; _i++) {
            var item = items_1[_i];
            var itemId = conf.nestedIds
                ? this.getNestedProperty(item, conf.id)
                : item[conf.id];
            var parentId = conf.nestedIds
                ? this.getNestedProperty(item, conf.parentId)
                : item[conf.parentId];
            if (conf.rootParentIds[itemId]) {
                throw new Error("The item array contains a node whose parentId both exists in another node and is in " +
                    ("`rootParentIds` (`itemId`: \"" + itemId + "\", `rootParentIds`: " + Object.keys(conf.rootParentIds)
                        .map(function (r) {return "\"" + r + "\"";})
                        .join(", ") + ")."));
            }
            // look whether item already exists in the lookup table
            if (!Object.prototype.hasOwnProperty.call(lookup, itemId)) {
                // item is not yet there, so add a preliminary item (its data will be added later)
                lookup[itemId] = (_a = {}, _a[conf.childrenField] = [], _a);
            }
            // if we track orphans, delete this item from the orphan set if it is in it
            if (orphanIds) {
                orphanIds.delete(itemId);
            }
            // add the current item's data to the item in the lookup table
            if (conf.dataField) {
                lookup[itemId][conf.dataField] = item;
            }
            else {
                lookup[itemId] = __assign(__assign({}, item), (_b = {}, _b[conf.childrenField] = lookup[itemId][conf.childrenField], _b));
            }
            var treeItem = lookup[itemId];
            if (parentId === 0 ||
                conf.rootParentIds[parentId]) {
                // is a root item
                rootItems.push(treeItem);
            }
            else {
                // has a parent
                // look whether the parent already exists in the lookup table
                if (!Object.prototype.hasOwnProperty.call(lookup, parentId)) {
                    // parent is not yet there, so add a preliminary parent (its data will be added later)
                    lookup[parentId] = (_c = {}, _c[conf.childrenField] = [], _c);
                    // if we track orphans, add the generated parent to the orphan list
                    if (orphanIds) {
                        orphanIds.add(parentId);
                    }
                }
                // add the current item to the parent
                lookup[parentId][conf.childrenField].push(treeItem);
            }
        }
        if (orphanIds === null || orphanIds === void 0 ? void 0 : orphanIds.size) {
            throw new Error("The items array contains orphans that point to the following parentIds: " +
                ("[" + Array.from(orphanIds) + "]. These parentIds do not exist in the items array. Hint: prevent orphans to result ") +
                "in an error by passing the following option: { throwIfOrphans: false }");
        }
        return rootItems;
    }

    getNestedProperty(item, nestedProperty) {
        return nestedProperty.split(".").reduce(function (o, i) {return o[i];}, item);
    }

    /**
    * this method will draw multiple data 
    */
    drawData() {
        //start loading

        //if data is exist
        if (this.data.flatten.length > 0) {
            //first reshape data

            let order = (list, p = {id: 0, Child: []}, tree = []) => {
                return this.arrayToTree(list, {dataField: null});
            }

            //then create nodes
            let set = (list) => {
                for (let i = 0; i < list.length; i++) {
                    this.createNode({
                        n_addional: list[i].n_addional,
                        n_value: list[i].id,
                        title: list[i].title,
                        id: list[i].id,
                        path: list[i].path,
                        parentid: list[i].parentid,
                        child: list[i].Child,
                        dataType: list[i].dataType,
                        n_parent: this.getNode(list[i].parentid),
                        n_checkStatus: typeof list[i].n_checkStatus === 'undefined' ? false : list[i].n_checkStatus
                    });
                    if (list[i].Child) {
                        set(list[i].Child);
                    }
                }
            }
            //start chain
            // console.log(order(this.data));
            set(order(this.data.flatten));

        }

        //start drawcallback
        if (this.drawCallback !== undefined) this.drawCallback();
        //end loading
    }

    selectFunction(event) {
        console.log(event);
    }

    //#endregion

    // -------------------flatten-----------------

    flattenJSON(obj) {
        //-------------flatten call----------------------
        let list = [];
        this.flattenId = 0;
        this.flattenLoop(obj, list);

        return {flatten: list};
        // console.log(list);

        // ----------------- unflatten call------------- 

        // let objForm = {};
        // this.makeObj(list, objForm);
        // console.log(objForm);
        // return { flatten: list, unflatten: objForm};
    }

    getPathList(key, pathObj) {
        let pathList = [];
        if (pathObj && pathObj.dataType == 'array') {
            pathList.push(`${pathObj.path}[${pathObj.index}]`, key);
        } else if (pathObj && pathObj.dataType == 'object') {
            pathList.push(pathObj.path, key)
        } else {
            pathList.push(key);
        }
        return pathList;
    }

    cloneList(list) {
        let cloneList = [];
        list.forEach((ele) => {
            cloneList.push(ele);
        });
        return cloneList;
    }

    flattenLoop(obj, list, pathObj = {}) {
        for (let key in obj) {
            let pathList = this.getPathList(key, pathObj);
            if (Array.isArray(obj[key])) {
                let arrayObj = this.setObjInArray(key, list, pathList, pathObj, 'array', obj[key]);
                obj[key].forEach((ele, i) => {
                    if (typeof (ele) == 'object') {
                        arrayObj['index'] = i;
                        this.flattenLoop(ele, list, arrayObj);
                    } else {
                        let newPathList = this.cloneList(pathList);
                        newPathList[newPathList.length - 1] = `${newPathList[newPathList.length - 1]}[${i}]`;
                        this.setObjInArray(ele, list, newPathList, arrayObj, typeof (ele), obj[key][i]);
                    }
                });
                delete arrayObj['index'];
            } else if (typeof (obj[key]) == 'object') {
                let arrayObj = this.setObjInArray(key, list, pathList, pathObj, 'object', obj[key]);
                this.flattenLoop(obj[key], list, arrayObj);
            } else {
                this.setObjInArray(key, list, pathList, pathObj, typeof (obj[key]), obj[key]);
            }
        }
        console.log('HI');

        console.log(obj, list, pathObj);
    }

    setObjInArray(key, list, pathList, pathObj, type, value) {
        let arrayObj = {
            "id": this.flattenId,
            "title": key,
            "parentid": pathObj && pathList.length > 1 ? pathObj.id : 0,
            "dataType": type,
            "path": pathList.length > 1 ? pathList.join('.') : pathList[0],
            "value": value
        }
        list.push(arrayObj);
        this.flattenId++;
        return arrayObj;
    }

    // -------------unflatten code ----------------

    makeObj(list, obj) {
        for (let i = 0; i < list.length; i++) {
            if (list[i].path.includes('.')) {
                let pathList = list[i].path.split('.');
                this.setObj(pathList, obj, list, list[i]);
            } else {
                if (list[i].dataType == 'object') {
                    obj[list[i].title] = {};
                } else if (list[i].dataType == 'array') {
                    obj[list[i].title] = [];
                } else {
                    if (list[i].dataType == 'number') {
                        obj[list[i].title] = list[i].value;
                    } else {
                        obj[list[i].title] = list[i].value
                    }
                }
            }
        }
        return {unflatten: obj};
    }

    setObj(pathList, obj, list, listObj) {
        let childObj = obj;
        for (let i = 0; i < pathList.length; i++) {
            if (pathList[i].includes('[')) {
                let objPath = pathList[i].split('[');
                let pathName = objPath[0];
                let index = parseInt(objPath[1].split(']')[0]);
                if (i < (pathList.length - 1)) {
                    if (!childObj[pathName][index]) {
                        childObj[pathName][index] = {};
                    }
                } else {
                    let arrayObj = list.find(ele => ele.path == listObj.path);
                    childObj[pathName][index] = arrayObj.title;
                    break;
                }
                childObj = childObj[pathName][index];
            } else if (childObj[pathList[i]]) {
                childObj = childObj[pathList[i]];
            } else {
                let arrayObj = list.find(ele => ele.path == pathList.join('.'));
                if (arrayObj && arrayObj.dataType == 'array') {
                    childObj[pathList[i]] = [];
                } else if (arrayObj && arrayObj.dataType == 'object') {
                    childObj[pathList[i]] = {};
                } else if (arrayObj && arrayObj.dataType == 'boolean') {
                    childObj[pathList[i]] = arrayObj.value;;
                } else if (arrayObj && arrayObj.dataType == 'number') {
                    childObj[pathList[i]] = arrayObj.value;;
                } else {
                    childObj[pathList[i]] = arrayObj.value;
                }
            }
        }
    }


    makeObj1(list, obj) {
        for (let i = 0; i < list.length; i++) {
            if (list[i].path.includes('.')) {
                let pathList = list[i].path.split('.');
                this.setObj1(pathList, obj, list, list[i]);
            } else {
                if (list[i].dataType == 'object') {
                    obj[list[i].title] = {};
                } else if (list[i].dataType == 'array') {
                    obj[list[i].title] = [];
                } else {
                    if (list[i].dataType == 'number') {
                        obj[list[i].title] = '$' + list[i].path;
                    } else {
                        obj[list[i].title] = '$' + list[i].path
                    }
                }
            }
        }
        return {unflatten: obj};
    }

    setObj1(pathList, obj, list, listObj) {
        let childObj = obj;
        for (let i = 0; i < pathList.length; i++) {
            if (pathList[i].includes('[')) {
                let objPath = pathList[i].split('[');
                let pathName = objPath[0];
                let index = parseInt(objPath[1].split(']')[0]);
                if (i < (pathList.length - 1)) {
                    if (!childObj[pathName][index]) {
                        childObj[pathName][index] = {};
                    }
                } else {
                    let arrayObj = list.find(ele => ele.path == listObj.path);
                    childObj[pathName][index] = arrayObj.title;
                    break;
                }
                childObj = childObj[pathName][index];
            } else if (childObj[pathList[i]]) {
                childObj = childObj[pathList[i]];
            } else {
                let arrayObj = list.find(ele => ele.path == pathList.join('.'));
                if (arrayObj && arrayObj.dataType == 'array') {
                    childObj[pathList[i]] = [];
                } else if (arrayObj && arrayObj.dataType == 'object') {
                    childObj[pathList[i]] = {};
                } else if (arrayObj && arrayObj.dataType == 'boolean') {
                    childObj[pathList[i]] = '$' + arrayObj.path;
                } else if (arrayObj && arrayObj.dataType == 'number') {
                    childObj[pathList[i]] = '$' + arrayObj.path;
                } else {
                    childObj[pathList[i]] = '$' + arrayObj.path;
                }
            }
        }
    }
}
