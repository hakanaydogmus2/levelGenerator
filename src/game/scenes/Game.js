import { Scene } from 'phaser';

export class Game extends Scene
{

    constructor ()
    {
        super('Game');
        this.gridSize = 64;
        this.rows = 12;
        this.cols = 12;
        this.offsetX = 512 - (this.cols / 2) * this.gridSize;
        this.offsetY = 384 - (this.rows / 2) * this.gridSize;
        this.words = ['SEAT', 'EAT', 'TEA', 'SET', 'EAST', 'TEASE','UUU', 'ARABA'];
        this.placedWords = []; // [ {word: "SEAT", position: "horizontal" ,letters: [{letter: "S", position: {x, y}}, {letter: "E", position: {x, y }}, ...]} }, ...]

    }


    create ()
    {
        this.cameras.main.setBackgroundColor(0xffffff);
        this.gridGroup = this.add.group();
        this.wordGroup = this.add.group();

        for (let i = 0; i < this.cols; i++) {
            for (let j = 0; j < this.rows; j++) {
                const rect = this.add.rectangle(
                    this.offsetX + i * this.gridSize + this.gridSize / 2,
                    this.offsetY + j * this.gridSize + this.gridSize / 2,
                    this.gridSize - 2,
                    this.gridSize - 2,
                    0xffffff
                ).setStrokeStyle(2, 0x000000);
                this.gridGroup.add(rect);
            }
        }
        
        this.generatePuzzle();

        const refreshButton = this.add.text(900, 700, 'Refresh', { fontSize: '24px', color: '#0000ff' })
            .setInteractive()
            .on('pointerdown', () => {
                this.refreshPuzzle();
        });
    
    }


    refreshPuzzle() {
        this.generatePuzzle();
    }

    generatePuzzle() {
        if (this.wordGroup) {
            this.wordGroup.clear(true, true);
        }

        this.wordGroup = this.add.group();
        this.words = this.shuffleByWordLength(this.words);
        this.placedWords = [];
        let notPlacedWords = [];
        // İlk kelimeyi ortalayarak yerleştir
        this.placeFirstWord();


        for (let i = 1; i < this.words.length; i++) {
            const word = this.words[i];
            const possiblePositions = this.calculatePossibleWordPositions(word, this.placedWords);

            if (possiblePositions.length > 0) {
                const chosenPlacement = this.selectRandomElement(possiblePositions);
                this.placedWords.push(chosenPlacement);

            } else {
                notPlacedWords.push(word);
            }
            
        }

        
        // eğer herhangi bir kelimenin bir harfi yasaklı pozisyona denk geldiyse yeniden dene
        const invalidWords = this.placedWords.filter(wordObj => !this.checkIsValidPlacement(wordObj));
        if (invalidWords.length > 0) {
            console.log("Geçersiz yerleşim tespit edildi, yeniden dene.");
            this.generatePuzzle();
            return;
        }
        
        console.log("Yerleştirilen Kelimeler:", this.placedWords);

        this.displayPlacedWords();
    }
    
    checkIsValidPlacement(placement){
        const forbidden = this.calculateForbiddenPositions(this.placedWords);
        const forbiddenSet = new Set(forbidden.map(p => `${p.x},${p.y}`));

        for (const letterObj of placement.letters) {
            const posKey = `${letterObj.position.x},${letterObj.position.y}`;
            if (forbiddenSet.has(posKey)) {
                return false; // yasaklı pozisyona denk geliyor
            }
        }

        return true; // tüm harfler geçerli pozisyonda
    }

    displayPlacedWords(){
        this.placedWords.forEach(word => {
            const letters = word.letters;
            letters.forEach(letterObj => {
                const { letter, position } = letterObj;
                const text = this.add.text(
                    this.offsetX + position.x * this.gridSize + this.gridSize / 2,
                    this.offsetY + position.y * this.gridSize + this.gridSize / 2,
                    letter,
                    { fontSize: '32px', color: '#000' }
                ).setOrigin(0.5);

                this.wordGroup.add(text); // <<< Burada wordGroup’a ekliyoruz
            });
        });
    }


    calculateForbiddenPositions(currentPlacedWords){
        // Bu fonksiyon, mevcut yerleştirilmiş kelimelere göre yasaklı pozisyonları hesaplar
        const positions = [];
        currentPlacedWords.forEach(wordObj => {
            const { letters, position } = wordObj;
            if (position === 'horizontal') {
                // eğer yatay ise (x artar, y sabit) bu yüzden (x-1,y) ile (x + length(word) -1 ,y) yasak  
                // ilk harfin koordinatları
                const firstLetter = letters[0].position;
                const lastLetter = letters[letters.length - 1].position;
                console.log(`Yatay kelime: ${wordObj.word}, yasak pozisyonlar: (${firstLetter.x - 1},${firstLetter.y}) ile (${lastLetter.x + 1},${lastLetter.y})`);

                positions.push({x: firstLetter.x - 1, y: firstLetter.y});
                positions.push({x: lastLetter.x + 1, y: lastLetter.y});
            }
            else if (position === 'vertical') {
                // eğer dikey ise (y artar, x sabit) bu yüzden (x,y-1) ile (x, y + length(word) -1) yasak  
                const firstLetter = letters[0].position;
                const lastLetter = letters[letters.length - 1].position;
                console.log(`Dikey kelime: ${wordObj.word}, yasak pozisyonlar: (${firstLetter.x},${firstLetter.y - 1}) ile (${lastLetter.x},${lastLetter.y + 1})`);

                positions.push({x: firstLetter.x, y: firstLetter.y - 1});
                positions.push({x: lastLetter.x, y: lastLetter.y + 1});
            }
        });

        const commonLetters = this.getCommonLettersPositionsOnGrid();
        const letterPositions = new Set();

        currentPlacedWords.forEach(wordObj => {
            wordObj.letters.forEach(({ position }) => {
                letterPositions.add(`${position.x},${position.y}`);
            });
        });

        commonLetters.forEach(common => {
            const { x, y } = common.position;
            const diagonals = [
                { x: x - 1, y: y - 1 },
                { x: x + 1, y: y - 1 },
                { x: x - 1, y: y + 1 },
                { x: x + 1, y: y + 1 }
            ];

            diagonals.forEach(d => {
                let count = 0;

                if (letterPositions.has(`${d.x},${d.y - 1}`)) count++;
                if (letterPositions.has(`${d.x},${d.y + 1}`)) count++;
                if (letterPositions.has(`${d.x - 1},${d.y}`)) count++;
                if (letterPositions.has(`${d.x + 1},${d.y}`)) count++;

                if (count >= 2) {
                    positions.push(d);
                }
            });
        });

        // --- Tekrar eden pozisyonları filtrele ---
        const uniquePositions = [];
        const seen = new Set();

        positions.forEach(pos => {
            const key = `${pos.x},${pos.y}`;
            if (!seen.has(key)) {
                seen.add(key);
                uniquePositions.push(pos);
            }
        });

        console.log('Yasak Pozisyonlar:', uniquePositions);
        return uniquePositions;
    }

    getCommonLettersPositionsOnGrid() {
        const positionsMap = new Map();

        for (let i = 0; i < this.placedWords.length; i++) {
            const word1 = this.placedWords[i];

            for (let j = i + 1; j < this.placedWords.length; j++) {
                const word2 = this.placedWords[j];

                for (let l1 of word1.letters) {
                    for (let l2 of word2.letters) {
                        if (l1.position.x === l2.position.x && l1.position.y === l2.position.y) {
                            const key = `${l1.position.x},${l1.position.y}`;
                            if (!positionsMap.has(key)) {
                                positionsMap.set(key, {
                                    letter: l1.letter,
                                    position: l1.position
                                });
                            }
                        }
                    }
                }
            }
        }

        return Array.from(positionsMap.values());
    }

    calculatePossibleWordPositions(word, currentPlacedWords) {
        const results = [];
        const wordLetters = word.split('');
        const forbidden = this.calculateForbiddenPositions(currentPlacedWords); 
        const forbiddenSet = new Set(forbidden.map(p => `${p.x},${p.y}`));

        // Mevcut harflerin konumlarını set olarak topla
        const existingPositions = {};
        currentPlacedWords.forEach(wordObj => {
            wordObj.letters.forEach(l => {
                existingPositions[`${l.position.x},${l.position.y}`] = l.letter;
            });
        });

        // 1. Ortak harfleri bul
        currentPlacedWords.forEach(wordObj => {
            wordObj.letters.forEach(placedLetter => {
                const { letter, position } = placedLetter;
                const { x, y } = position;

                // Bu kelimenin içinde ortak harf var mı kontrol et
                wordLetters.forEach((l, wordIndex) => {
                    if (l === letter) {

                        // --- Dikey yerleştirme ---
                        const verticalPlacement = [];
                        let validVertical = true;
                        let overlapCount = 0;

                        for (let i = 0; i < wordLetters.length; i++) {
                            const nl = wordLetters[i];
                            const newY = y + (i - wordIndex);
                            const posKey = `${x},${newY}`;

                            if (newY < 0 || newY >= this.rows || forbiddenSet.has(posKey)) {
                                validVertical = false;
                                break;
                            }

                            if (existingPositions[posKey]) {
                                if (existingPositions[posKey] !== nl) {
                                    validVertical = false; // farklı harf üst üste gelmiş
                                    break;
                                } else {
                                    overlapCount++;
                                }
                            }

                            verticalPlacement.push({ letter: nl, position: { x, y: newY } });
                        }

                        if (validVertical && overlapCount <= 1) {
                            results.push({
                                word,
                                position: 'vertical',
                                letters: verticalPlacement
                            });
                        }

                        // --- Yatay yerleştirme ---
                        const horizontalPlacement = [];
                        let validHorizontal = true;
                        let overlapCountH = 0;

                        for (let i = 0; i < wordLetters.length; i++) {
                            const nl = wordLetters[i];
                            const newX = x + (i - wordIndex);
                            const posKey = `${newX},${y}`;

                            if (newX < 0 || newX >= this.cols || forbiddenSet.has(posKey)) {
                                validHorizontal = false;
                                break;
                            }

                            if (existingPositions[posKey]) {
                                if (existingPositions[posKey] !== nl) {
                                    validHorizontal = false;
                                    break;
                                } else {
                                    overlapCountH++;
                                }
                            }

                            horizontalPlacement.push({ letter: nl, position: { x: newX, y } });
                        }

                        if (validHorizontal && overlapCountH <= 1) {
                            results.push({
                                word,
                                position: 'horizontal',
                                letters: horizontalPlacement
                            });
                        }
                    }
                });
            });
        });

        return results;
    }   

    placeFirstWord() {
        const firstWord = this.words[0];
        const firstWordLetters = firstWord.split('');
    
        // Başlangıç koordinatlarını ortada ayarlıyoruz
        const isHorizontal = true; // ilk kelime hep yatay (istersen random yapabilirsin)
        const startX = Math.floor((this.cols - firstWordLetters.length) / 2);
        const startY = Math.floor(this.rows / 2);
    
        // Harfleri array'e çevir
        const lettersArr = firstWordLetters.map((letter, index) => {
            return {
                letter,
                position: {
                    x: isHorizontal ? startX + index : startX,
                    y: isHorizontal ? startY : startY + index
                }
            };
        });
    
        // placedWords arrayine ekle
        this.placedWords.push({
            word: firstWord,
            position: isHorizontal ? 'horizontal' : 'vertical',
            letters: lettersArr
        });
    }


    selectRandomElement(array) {
      const randomIndex = Math.floor(Math.random() * array.length);
      return array[randomIndex];
    }
      

    shuffleByWordLength(array) {
    // 1. Grupları uzunluğa göre ayır
        const groups = {};
        for (const word of array) {
            const len = word.length;
            if (!groups[len]) groups[len] = [];
            groups[len].push(word);
        }

        // 2. Her grubu kendi içinde shuffle et
        for (const len in groups) {
            const group = groups[len];
            for (let i = group.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [group[i], group[j]] = [group[j], group[i]];
            }
        }

        // 3. Uzundan kısaya birleştir
        const sortedLengths = Object.keys(groups).sort((a, b) => b - a);
        const result = [];
        for (const len of sortedLengths) {
            result.push(...groups[len]);
        }

        return result;
    }
}
