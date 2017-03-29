# 基于canvas兼容移动端和pc端的手势密码组件

## 任务需求
在移动端设备上，“手势密码”成为一个很常用的 UI 组件。

用户用手指按顺序依次划过 9 个原点中的若干个（必须不少于 4个点），如果划过的点的数量和顺序与之前用户设置的相同，那么当用户的手指离开屏幕时，判定为密码输入正确，否则密码错误。
要求：实现一个移动网页，允许用户设置手势密码和验证手势密码。已设置的密码记录在本地 localStorage 中。

操作流程如下：
##### stat 1：设置密码
用户选择设置密码，提示用户输入手势密码
##### stat 2：密码长度太短
如果不足 5 个点，提示用户密码太短
##### stat 3：再次输入密码
提示用户再次输入密码
##### stat 4: 两次密码输入不一致
如果用户输入的两次密码不一致，提示并重置，重新开始设置密码
##### stat 5: 密码设置成功
如果两次输入一致，密码设置成功，更新 localStorage
##### stat 6: 验证密码 - 不正确
切换单选框进入验证密码模式，将用户输入的密码与保存的密码相比较，如果不一致，则提示输入密码不正确，重置为等待用户输入。
##### stat 7: 验证密码 - 正确
如果用户输入的密码与 localStorage 中保存的密码一致，则提示密码正确。



## 实现要点
##### 1.将画手势等应用放在canvas画布上，来实现画线和画圆,具有手势跟随线的功能（drawFollowLine();）；
##### 2.将密码顺序存入一个数组中，并且同时存入一个键值对中，从而来判断是否画过这个点，避免重复画；
##### 3.由于需要设置密码判断2次，验证密码判断，这样设置了3个用来存储的对象，为了方便画布更新，还存了一个空白对象，将这些都存入一个数组中；
##### 4.根据需求将最终设置成功的密码存入localStorage中；
##### 5.组件模式：将html代码也写在js代码中，通过html2node进行转化插入dom中，并且让用户将组件的父容器container存入；
##### 6.可拓展性：因为用的是extend方式传入用户指定的对象事件，很容易可以后期增加功能；
##### 7.增加了unlockSuccess和setSucess两个事件（密码设置成功，密码验证成功），可以让用户在事件上绑定函数，增加功能可拓展性，如：

```
lock.on('unlockSuccess', function(){
        console.log("用户设定：解锁成功啦！");
    });
lock.on('setSuccess', function(){
    console.log("用户设定：密码设置成功啦！");
});
```
##### 8.引入animate.css动画库，增加了一些验证成功或失败的样式，通过addClass()和resetClass()两个函数进行修改，addClass增加了定时删除效果的功能。





## 主要难点

### 1. 移动端的实现

难点：如何实现移动端的兼容问题。

解决方法：
<meta name="viewport" content="width=device-width,initial-scale=1,user-scalable=no">

知识点：

1. 物理像素与我们说的px像素不同。

iphone5的640*1136 像素事实上是 320px*568px

**px：**
逻辑像素，是浏览器使用的抽象单位,CSS pixels

**dp，pt：**
是设备无关像素，device independent pixels

**dpr：**
是设备像素缩放比, devicePixelRatio

1px = (dpr)^2 * dp

而iphone5的dpr是2，所以与我们听到的像素是有差别的。

2. viewpoint

手机浏览器默认将viewport设为980px（ios设备上），并且进行了缩放。---当然这是为了排版正确

但这导致了我并不能显示的很好。

因此将viewpoint设置为device-width这样就按照手机正常的宽度来了。

3. initial-scale初始缩放比

是 window.innerWidth / document.body.clientWidth

将这个设置为1，可以保证这两个相等。
【布局viewport】=【设备宽度】=【度量viewport】

4. user-scalable = no
当然就是不让用户缩放啦，避免手机端的一些用户操作。



### 2. 画线

**难点：**
如果让我画个圆，我可以用div改变border来实现，但是画一根线，就不太容易实现它的定位了，尤其是我增加了跟随手指头（鼠标）的线

**解决方法：**
我想到了canvas。

什么是 Canvas?


> HTML5 <canvas> 元素用于图形的绘制，通过脚本 (通常是JavaScript)来完成.
> <canvas> 标签只是图形容器，您必须使用脚本来绘制图形。
> 你可以通过多种方法使用Canva绘制路径,盒、圆、字符以及添加图像。

canvas自带可以根据坐标画线，一下子就可以解决这个问题

但是要注意：canvas上面画上去的元素并不能通过获取元素来改变样式，因此必须不停的刷新画布，才能改变样式，比如手指头经过一个圆圈的时候，改变颜色。

### 3.兼容pc端和移动端touch事件

**问题：**
移动端有什么不同于mouse事件的触摸事件吗？

**解决方案**：

经过查阅，找到了e.touches可以获取touch的点的信息，并且还有touchdown,touchmove,touchend等事件可以来进行处理。

### 4. pc端mouseover在没有mousedown的时候就也触发了

**问题：**
由于我个人希望一个组件可以兼容pc和移动端，当我做完了移动端的时候才发现了pc端有这个bug

**解决方案：**
设定一个全局变量mouse_status,从而来记录是否鼠标按下。
这里发现移动端就没有touchmove会随意触发的情况。





## 我碰到的问题

### 1.面向过程 TO 面向对象

最开始很快写出来一份完全面向过程的代码，在一个js文件中，定义了很多全局变量，很多个函数，最后获取对应元素的addEventListener来进行各种事件的操作，但后来觉得应该做成个组件的样子，就开始改成构造函数+原型的方式。

但是在改的过程中，除了加各种this外，发现很多地方的this指向不对了。

并不是单纯的增加个this那么简单了。

在很多地方增加了
```
var that = this;
```
但其实还有个问题没有解决：在使用
```
this.ele.addEventListener（"click",this.fn）;
```
因为是构造函数里面，所以都加了this，但是fn函数的作用域的this指向了this.ele而不是最外面的LockMobile了，曾经尝试过

```
this.ele.addEventListener("click",this.fn.bind(this));
```
但是这样会导致event这个事件无法传入fn函数。

这个问题困扰我许久没有完全解决，我自己的解决方案就是：

```
var that = this;
this.ele.addEventListener("click",function(){
    console.log(that); //就是LockMobile了
})
```

但是这就让我放弃了把函数fn写在外面定义了。
也尝试过用闭包来解决这个问题，但总觉的闭包不是很优雅，于是还是放弃单独写个fn在外面了。
没想通该如何解决这个问题，还是只能用闭包解决？
