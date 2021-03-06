
function createRandomItem() {
  var hexColor = Math.floor(Math.random() * 16777215).toString(16);
  while (hexColor.length < 6) {
    hexColor = '0' + hexColor;
  }
  hexColor = '#' + hexColor;
  var randomWidth = Math.floor(Math.random() * 800 + 200);
  return {color: hexColor, width: randomWidth};
}

function reassignId(item, index) {
  return {id: index, color: item.color, width: item.width};
}

var ManyModel = Cycle.createModel(function (intent) {
  var addItemMod$ = intent.get('addItem$').map(function (amount) {
    var newItems = [];
    for (var i = 0; i < amount; i++) {
      newItems.push(createRandomItem());
    }
    return function (listItems) {
      return listItems.concat(newItems).map(reassignId);
    };
  });

  var removeItemMod$ = intent.get('removeItem$').map(function (id) {
    return function (listItems) {
      return listItems.filter(function (item) { return item.id !== id; })
        .map(reassignId);
    };
  });

  var colorChangedMod$ = intent.get('changeColor$').map(function(x) {
    return function (listItems) {
      listItems[x.id].color = x.color;
      return listItems;
    };
  });

  var widthChangedMod$ = intent.get('changeWidth$').map(function (x) {
    return function (listItems) {
      listItems[x.id].width = x.width;
      return listItems;
    };
  });

  var itemModifications = Cycle.Rx.Observable.merge(
    addItemMod$, removeItemMod$, colorChangedMod$, widthChangedMod$
  );

  return {
    items$: itemModifications
      .startWith([{id: 0, color: 'red', width: 300}])
      .scan(function (listItems, modification) {
        return modification(listItems);
      })
  };
});
