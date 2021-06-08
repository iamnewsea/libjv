## Js数据原型扩展

### Array
    
    Array.init(number:Int,value:Object) 静态方法使用number 个 value 初始化数组  
    IndexOf(filter) 区别于默认的 indexOf, 大写的 IndexOf参数可以是回调。
    LastIndexOf(filter) 区别于 lastIndexOf,参数可以是回调。
    last(filter) 参数可以是回调，返回最后一个匹配项。
    ForEach(filter, trueAction, falseAction) ,增强型循环 ，是 forEachIndexed 方法的别名。
    putDistinct(item,equalFunc) , 添加时去重。 
    distinct(equalFunc) , 去重。
    pushAll(arrayOrSetValue) , 添加多个
    swap(index1, index2) 交换
    兼容性扩展 includes
    recursion(subCallback, action) 递归树
    minus(otherArray, equalFunc) 集合减法。
    intersect(otherArray, equalFunc) 集合交集
    unwind() 集成展开。
    max(compare) 取最大值 
    min(compare) 取最大值 
    sum(emptyValue) 求和，参数是当集合为空时返回的内容。
    removeAt(index) 移除指定索引项。
    removeAt(removeItem) 移除指定项。

### Date

