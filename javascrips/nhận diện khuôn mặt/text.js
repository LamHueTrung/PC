var A = 1;
function T() {
    var A = 2;
    A++;
    document.write("A: " + A);
}
T();
document.write("A:" + A);