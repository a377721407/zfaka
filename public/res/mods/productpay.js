﻿layui.define(['layer', 'form'], function(exports){
	var $ = layui.jquery;
	var layer = layui.layer;
	var oid = $("#oid").val();
	
	$('.layui-btn').on('click', function(event) {
		event.preventDefault();
		var paymethod = $(this).attr("data-type");
        $.ajax({
            type: "POST",
            dataType: "json",
            url: "/product/order/payajax",
            data: { "csrf_token": TOKEN,'paymethod':paymethod,'oid':oid },
            success: function(data) {
                if (data.code == 1) {
					layer.open({
						type: 1
						,title: false
						,offset: 'auto'
						,id: 'layerDemoauto' //防止重复弹出
						,content: '<div style="text-align: center;"><img src="/product/order/showqr/?url='+data.data+'" alt="当面付" width="230" height="230"><p>请使用手机支付宝扫一扫</p><p>扫描二维码完成支付</p></div>'
						,btn: '关闭'
						,btnAlign: 'c' //按钮居中
						,shade: 0 //不显示遮罩
						,yes: function(){
							layer.closeAll();
						}
					});
					queryPay();
                } else {
					layer.msg(data.msg,{icon:2,time:5000});
                }
                return;
            }
        });
	});
	
	
    // 检查是否支付完成
    function queryPay() {
        $.ajax({
            type: "POST",
            dataType: "json",
            url: "/product/query/pay",
            timeout: 10000, //ajax请求超时时间10s
            data: {"csrf_token": TOKEN,'oid':oid}, //post数据
            success: function (res, textStatus) {
                //从服务器得到数据，显示数据并继续查询
                if (res.code>1) {
					setTimeout(queryPay(), 4000);
                } else {
					layer.closeAll();
					location.href = '/product/query/?orderid='+res.data.orderid;
                }
            },
            //Ajax请求超时，继续查询
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                if (textStatus == "timeout") {
                    setTimeout(queryPay(), 1000);
                } else { //异常
                    setTimeout(queryPay(), 4000);
                }
            }
        });
    }
	
	exports('productpay',null)
});