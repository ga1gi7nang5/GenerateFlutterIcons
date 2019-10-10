/*************
 *
 * PhotoShop Script for App
 *
 * Copyright (c) 2014, Chen Ronggui
 * All rights reserved.
 * @Mail: crg900118@gmail.com
 *
 * License: BSD License
 *
 *************/

#target photoshop

/**
 * Create a dialog.
 **/
function showDialog() {

  var config = {};

  var dialog = new Window("dialog", "应用图标生成");

  // set dialog background color to the host application
  var brush = dialog.graphics.newBrush (dialog.graphics.BrushType.THEME_COLOR, "appDialogBackground");
  dialog.graphics.backgroundColor = brush;
  dialog.graphics.disabledBackgroundColor = dialog.graphics.backgroundColor;

  dialog.orientation = 'column';
  dialog.alignChildren = 'left';

  // 添加第一行
  dialog.add('statictext', undefined, '存储到:');

  // 添加左右两栏
  dialog.box = dialog.add('group');
  dialog.box.orientation = 'row';
  dialog.box.alignChildren = 'top';
  dialog.alignment = 'fill';

  // box left
  dialog.boxLeft = dialog.box.add('group');
  dialog.boxLeft.orientation = 'column';
  dialog.boxLeft.alignChildren = 'left';
  dialog.boxLeft.alignment = 'fill';

  // box left, 1st line.
  dialog.storeBox = dialog.boxLeft.add('group');
  dialog.storeBox.orientation = 'row';
  dialog.storeBox.alignChildren = 'center';
  dialog.destFolder = dialog.storeBox.add('edittext', undefined, app.activeDocument.path.parent);
  dialog.destFolder.preferredSize.width = 160;
  dialog.btnBrowse = dialog.storeBox.add('button', undefined, '浏览');
  dialog.btnBrowse.onClick = function() {
    var defaultFolder = dialog.destFolder.text;
    var testFolder = new Folder(defaultFolder);

    if (!testFolder.exists) {
      defaultFolder = app.activeDocument.path.parent;
    }

    var chooseFolder = Folder.selectDialog('选择要存储到的文件夹', defaultFolder);
    if (chooseFolder != null) {
      dialog.destFolder.text = chooseFolder.fsName;
    }

    config.path = dialog.destFolder.text;
  };

  // box left, 2nd line.
  dialog.boxLeft.add('statictext', undefined, '设备类型');
  dialog.saveTarget = dialog.boxLeft.add('group');
  dialog.saveTarget.orientation = 'row';
  dialog.saveTarget.alignChildren = 'center';
  dialog.saveTarget.alignment = 'fill';
  dialog.saveTarget.preferredSize.width = 160;

  var handleAndroid = dialog.saveTarget.add('checkbox', undefined, 'Android');
  var handleiPhone = dialog.saveTarget.add('checkbox', undefined, 'iPhone');
  handleAndroid.value = true;
  handleAndroid.preferredSize.width = 80;
  handleiPhone.preferredSize.width = 80;

  // box left, 3rd line.
  dialog.boxLeft.add('statictext', undefined, '存储类型');
  dialog.saveType = dialog.boxLeft.add('group');
  dialog.saveType.orientation = 'row';
  dialog.saveType.alignChildren = 'left';
  dialog.saveType.alignment = 'fill';

  var doAsAppIcon = dialog.saveType.add('radiobutton', undefined, '应用图标');
  var doAsLaunch = dialog.saveType.add('radiobutton', undefined, '启动界面');
  // default
  doAsAppIcon.value = true;

  // box right
  dialog.boxRight = dialog.box.add('group');
  dialog.boxRight.orientation = 'column';
  dialog.boxRight.alignChildren = 'fill';

  // alert message
  var alertBox = dialog.add('statictext', undefined, '', {multiline:true});
  alertBox.preferredSize.width = 160;

  dialog.btnSure = dialog.boxRight.add('button', undefined, '确定');
  dialog.btnSure.onClick = function() {
    var doc = app.activeDocument;

    if (!config.path) {
      config.path = doc.path.parent;
    }

    if (doAsLaunch.value) {
      config.isLaunch = true;
      config.isAppIcon = false;
    } else {
      config.isLaunch = false;
      config.isAppIcon = true;
    }

    config.android = handleAndroid.value;
    config.iphone = handleiPhone.value;
    config.fileName = doc.name.split('.')[0];

    if (!config.android && !config.iphone) {
      showAlert('请至少选择一种设备类型!');
      return;
    }

    // handleImage
    var result = handleImage(config);
    if (result) {
      dialog.close();
    } else {
      // handle image failed!
      showAlert("处理文件失败!");
    }

  };

  dialog.btnCancel = dialog.boxRight.add('button', undefined, '取消');
  dialog.btnCancel.onClick = function() {
    dialog.close();
  };

  dialog.show();

  function showAlert(msg) {

    if (!alertBox) {
      return;
    }

    if (typeof msg != 'string') {
      msg = msg.toString();
    }

    alertBox.text = msg;
    alertBox.graphics.foregroundColor =
        alertBox.graphics.newPen(dialog.graphics.PenType.SOLID_COLOR, [0.9, 0.1, 0.1], 1);
  }

}

/***
 * 生成相应的图片
 ***/
function handleImage(config) {

  var result = true;
  if (!config.path) {
    config.path = app.activeDocument.path.parent;
  }

  if (config.android) {
    result = result && handleImageToAndroid(config);
  }

  if (config.iphone) {
    result = result && handleImageToiPhone(config);
  }

  return result;
}

/***
 * 生成Android图片
 ***/
function handleImageToAndroid(config) {
  var result = true;
  // Android 应用图标与启动屏大小
  var iconSize = [48, 72, 96, 144, 192];
  var launchSize = [
    {
      width: 320,
      height: 480
    },
    {
      width: 480,
      height: 640
    },
    {
      width: 720,
      height: 960
    },
    {
      width: 960,
      height: 1280
    },
	{
      width: 1080,
      height: 1920
    }
  ];
  var resolutionStr = ['mipmap-mdpi', 'mipmap-hdpi', 'mipmap-xhdpi', 'mipmap-xxhdpi','mipmap-xxxhdpi'];
  var params = {
      fileName: 'ic_launcher_logo'
  };

  var i = 0, len = 0;

  if (config.isAppIcon) {
    for (i = 0, len = iconSize.length; i < len; i++) {
      params.path = config.path + '/android/' + resolutionStr[i];
      params.width = params.height = iconSize[i];
      result = result && generateImage(params);
    }
  } else {
    for (i = 0, len = launchSize.length; i < len; i++) {
      params.path = config.path + '/android/' + resolutionStr[i];
      params.width = launchSize[i].width;
      params.height = launchSize[i].height;
      result = result && generateImage(params);
    }
  }

  return result;
}

/***
 * 生成iPhone格式图片
 ***/
function handleImageToiPhone(config) {

  var doc = app.activeDocument;

  var result = true;
  var params = {
    path: config.path + '/iOS'
  };
  var iconSize = [20, 29, 40, 60, 76, 83.5, 1024];
  var iconMultiple = [[1, 2, 3], [1, 2, 3], [1, 2, 3], [2, 3], [1, 2], [2], [1]];
  if (config.isAppIcon) {
    for (i = 0, len = iconSize.length; i < len; i++) {
      var multipleList = iconMultiple[i]
      for (j = 0, len1 = multipleList.length; j < len1; j++) {
        params.fileName = 'Icon-App-' + iconSize[i] + 'x' + iconSize[i] + '@' + multipleList[j] + 'x';
        params.width = params.height = iconSize[i] * multipleList[j];
        result = result && generateImage(params);
      }
    }
  } else {
    result = result && toiPhoneLaunch();
  }

  function toiPhoneLaunch() {
    params.fileName = config.fileName + '_launch';
    params.width = 640;
    params.height = 1136;
    return generateImage(params);
  }

  function toiPadLaunch() {
    params.fileName = config.fileName + '_launch_ipad';
  }

  return result;
}

/***
 * 生成图片
 ***/
function generateImage(params) {
  var doc = app.activeDocument;
  var result = false;
  var hasResized = false;
  // var originHistoryIndex = doc.historyStates.length - 1;
  // 保存未开始之前的历史记录
  var originHistory = doc.activeHistoryState;

  var org_w = doc.width;
  var org_h = doc.height;

  var width = params.width || org_w;
  var height = params.height || org_h;

  if (width != org_w || height != org_h) {
    hasResized = true;
    // 调整图像大小
    doc.resizeImage(width, height);
  }

  var options = new PNGSaveOptions();
  options.compression = 5;

  var path = params.path || (doc.path.parent + '/' + 'MobileShop');
  var destFile = new File(path + '/' + params.fileName + '.png');
  mkdirs(destFile.parent);

  try {
    doc.saveAs(destFile, options, true, Extension.LOWERCASE);
    result = true;
  } catch (err) {
    alert(err);
    result = false;
  } finally {
    if (hasResized) {
      // doc.activeHistoryState = doc.historyStates[originHistoryIndex];
      // 恢复改动
      doc.activeHistoryState = originHistory;

      // 清除所有历史改动记录
      // app.purge(PurgeTarget.HISTORYCACHES);

      doc.save();
    }
  }

  return result;
}

/***
 * 如果文件夹不存在，则创建文件夹。
 ***/
function mkdirs(folder) {
  if (folder && !folder.exists && folder.create()) {
    mkdirs(folder.parent);
  }
}

!(function() {

  try {
    if (app && app.activeDocument) {
      showDialog();
    } else {
      alert('请打开PSD文件!');
    }
  } catch (err) {
    alert('出错了, 请打开PSD文件后再试!');
  }

})();
