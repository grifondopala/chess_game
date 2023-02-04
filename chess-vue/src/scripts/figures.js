/* eslint-disable */
class Figure{
    constructor(row, column, color){
        this.row = row;
        this.column = column;
        this.color = color;
        this.isMoved = false;
        this.isSelected = false;
    }
    
    changePosition(row, column){
        this.row = row;
        this.column = column;
    }

    getImageSrc(){
        return require("../assets/Images/" + this.constructor.name + this.color + ".png");
    }

    index(myColor, row = this.row, column = this.column){
        var a = (row - 1) * 8 + column - 1;
        if(myColor === "Black") return a;
        else return (63 - a);
    }

    findFigure(placesArr, row, column, color){
        for(let element of placesArr){
            if (element.row == row && element.column == column && (element.constructor.name === "EmptyPlace" || !(element.color === color))){
                return element;          
            }
        }
        return null;
    }

    changeSelected(placesArr, array){
        placesArr.map((element) => { if(array.includes(element)) element.isSelected = true })
        return placesArr;
    }

}

export class Pawn extends Figure{
    findPlaces(placesArr, isCheck = false){
        let array = [];
        let enemies = [];
        var i = (this.color === "White") ? 1 : -1;
        let figure = this.findFigure(placesArr, this.row + i, this.column, this.color);
        if(figure != null && figure.constructor.name === "EmptyPlace") array.push(figure);
        if(!this.isMoved && figure != null){
            figure = this.findFigure(placesArr, this.row + 2 * i, this.column, this.color);
            if(figure != null) array.push(figure);
        }
        figure = this.findFigure(placesArr, this.row + i, this.column - 1, this.color);
        if(figure != null){
            enemies.push(figure);
            if(!figure.constructor.name === "EmptyPlace") array.push(figure);
        }
        figure = this.findFigure(placesArr, this.row + i, this.column + 1, this.color);
        if(figure != null){
            enemies.push(figure);
            if(!figure.constructor.name === "EmptyPlace") array.push(figure);
        }
        return isCheck ? enemies : this.changeSelected(placesArr, array)
    }
}

export class Rook extends Figure{
    findPlaces(placesArr, isCheck = false){
        let array = [];
        var i = 1;
        while(i <= 8){
            let figure = this.findFigure(placesArr, this.row, this.column - i, this.color);
            if(figure == null) break; 
            array.push(figure);
            if(!(figure.constructor.name === "EmptyPlace")) break;
            i++;
        }
        i = 1;
        while(i <= 8){
            let figure = this.findFigure(placesArr, this.row, this.column + i, this.color);
            if(figure == null) break; 
            array.push(figure);
            if(!(figure.constructor.name === "EmptyPlace")) break;
            i++;
        }
        i = 1;
        while(i <= 8){
            let figure = this.findFigure(placesArr, this.row - i, this.column, this.color);
            if(figure == null) break; 
            array.push(figure);
            if(!(figure.constructor.name === "EmptyPlace")) break;
            i++;
        }
        i = 1;
        while(i <= 8){
            let figure = this.findFigure(placesArr, this.row + i, this.column, this.color);
            if(figure == null) break; 
            array.push(figure);
            if(!(figure.constructor.name === "EmptyPlace")) break;
            i++;
        }
        return isCheck ? array : this.changeSelected(placesArr, array)
    }
}

export class Knight extends Figure{
    findPlaces(placesArr, isCheck = false){
        let array = [];
        let arrayHelp = [[-2, 1], [-2, -1], [2, 1], [-1, -2], [-1, 2], [1, -2], [1, 2], [2, -1]];
        for(let element of arrayHelp){
            let figure = this.findFigure(placesArr, this.row + element[0], this.column + element[1], this.color);
            if(figure != null) array.push(figure);
        }
        return isCheck ? array : this.changeSelected(placesArr, array)
    }
}

export class Bishop extends Figure{
    findPlaces(placesArr, isCheck = false){
        let array = [];
        var i = 1;
        while(i <= 8){
            let figure = this.findFigure(placesArr, this.row - i, this.column - i, this.color);
            if(figure == null) break; 
            array.push(figure);
            if(!(figure.constructor.name === "EmptyPlace")) break;
            i++;
        }
        i = 1;
        while(i <= 8){
            let figure = this.findFigure(placesArr, this.row - i, this.column + i, this.color);
            if(figure == null) break; 
            array.push(figure);
            if(!(figure.constructor.name === "EmptyPlace")) break;
            i++;
        }
        i = 1;
        while(i <= 8){
            let figure = this.findFigure(placesArr, this.row + i, this.column + i, this.color);
            if(figure == null) break; 
            array.push(figure);
            if(!(figure.constructor.name === "EmptyPlace")) break;
            i++;
        }
        i = 1;
        while(i <= 8){
            let figure = this.findFigure(placesArr, this.row + i, this.column - i, this.color);
            if(figure == null) break; 
            array.push(figure);
            if(!(figure.constructor.name === "EmptyPlace")) break;
            i++;
        }
        return isCheck ? array : this.changeSelected(placesArr, array)
    }
}

export class King extends Figure{
    findPlaces(placesArr, isCheck = false){
        let array = [];
        let arrayHelp = [[-1, 1], [-1, 0], [-1, -1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]]
        //let enemies = FindEnemyPlaces(placesArr, this.color);
        for(let element of arrayHelp){
            let figure = this.findFigure(placesArr, this.row + element[0], this.column + element[1], this.color);
            if(figure != null) array.push(figure);
        }
        return isCheck ? array : this.changeSelected(placesArr, array);
    }

    //Функция шаха доделать
    check(placesArr, figure){

    }

}

export class Queen extends Figure{
    findPlaces(placesArr, isCheck = false){
        let rook = new Rook(this.row, this.column, this.color);
        let bishop = new Bishop(this.row, this.column, this.color);
        if(isCheck){
            let array1 = rook.findPlaces(placesArr, isCheck);
            let array2 = bishop.findPlaces(placesArr, isCheck);
            return Array.from(new Set(array1.concat(array2)));
        }
        rook.findPlaces(placesArr);
        bishop.findPlaces(placesArr);
        return placesArr;
    }
}

export class EmptyPlace{
    
    constructor(row, column){
        this.row = row;
        this.column = column;
        this.isSelected = false;
    }

    changePosition(row, column){
        this.row = row;
        this.column = column;
    }
    
    getImageSrc(){
        return this.constructor.name;
    }

    index(myColor){
        var a = (this.row - 1) * 8 + this.column - 1;
        if(myColor === "Black") return a;
        else return (63 - a);
    }

}

export function CreatePlacesArray(){
    let array = [
        new Rook(1, 1, "White"), new Knight(1,2, "White"),
        new Bishop(1, 3, "White"), new Queen(1, 4, "White"),
        new King(1, 5, "White"), new Bishop(1, 6, "White"),
        new Knight(1, 7, "White"), new Rook(1, 8, "White"),
        new Pawn(2, 1, "White"), new Pawn(2, 2, "White"),
        new Pawn(2, 3, "White"), new Pawn(2, 4, "White"),
        new Pawn(2, 5, "White"), new Pawn(2, 6, "White"),
        new Pawn(2, 7, "White"), new Pawn(2, 8, "White")
    ]
    for(var i = 17; i < 49; i++){
        if(i % 8 != 0) array.push(new EmptyPlace(Math.floor(i/8) + 1, i - Math.floor(i/8) * 8))
        else array.push(new EmptyPlace(Math.floor(i/8), 8))
    }
    array = array.concat([
        new Pawn(7, 1, "Black"), new Pawn(7, 2, "Black"),
        new Pawn(7, 3, "Black"), new Pawn(7, 4, "Black"),
        new Pawn(7, 5, "Black"), new Pawn(7, 6, "Black"),
        new Pawn(7, 7, "Black"), new Pawn(7, 8, "Black"),
        new Rook(8, 1, "Black"), new Knight(8, 2, "Black"),
        new Bishop(8, 3, "Black"), new Queen(8, 4, "Black"),
        new King(8, 5, "Black"), new Bishop(8, 6, "Black"),
        new Knight(8, 7, "Black"), new Rook(8, 8, "Black"),
    ])
    return array;
}

export function FindEnemyPlaces(placesArr, color){
    let enemies = placesArr.filter(place => place.constructor.name != 'EmptyPlace' && place.color != color);
    let attackedPlaces = [];
    for(let enemy of enemies){
        attackedPlaces = Array.from(new Set(attackedPlaces.concat(enemy.findPlaces(placesArr, true))));
    }
    return attackedPlaces;
}