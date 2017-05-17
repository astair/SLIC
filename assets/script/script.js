$('.ui.dropdown')
    .dropdown()
;

$("form").on("submit",  function(event){
    event.preventDefault();

    // Handle input data and convert to object
    var data = $(this).serializeArray().reduce(function(obj, item){
        obj[item.name] = item.value;
        return obj;
    }, {});

    // Propz object holds the chosen reaction conditions 
    var propz = {
        Tm: Number(data.tmMin),
        concDNA: 200,
        concNa: 50,
        concMg: 0
    };

    // Get the sequences and store in seqz object because it's more shizzle like that
    var seqz = {
        ins: data.insert.toUpperCase(),
        vec5: data.vector5.toUpperCase(),
        vec3: data.vector3.toUpperCase()
    }

    // Evaluate the Tm calculation method of choice
    switch (data.method){
        case "BS":
            var calcTm = calcTmBaseStacking;
            break;
        case "RT":
            var calcTm = calcTmBasic;
            break;      
    };

    console.log(data.overhang)

    // Construct Primer object for each case. Containing SLIC and basic
    switch (data.overhang){
        case "vector":
            var primerVecFor = primerForSlic(seqz, propz, calcTm, data.overhang);
            var primerVecRev = primerRevSlic(seqz, propz, calcTm, data.overhang);
            var primersIns = primerBasic(seqz.ins, propz, calcTm);
            var primers = [
                {
                    name: "Vector forward primer",
                    seq: primerVecFor.full,
                    propz: calcTm(primerVecFor.onVector, propz)
                },
                {
                    name: "Vector reverse primer",
                    seq: primerVecRev.full,
                    propz: calcTm(primerVecRev.onVector, propz)
                },
                {
                    name: "Insert forward primer",
                    seq: primersIns.for,
                    propz: calcTm(primersIns.for, propz)
                },
                {
                    name: "Insert reverse primer",
                    seq: primersIns.rev,
                    propz: calcTm(primersIns.rev, propz)
                }
            ];
            break;
        case "insert":
            var primerInsFor = primerForSlic(seqz, propz, calcTm, data.overhang);
            var primerInsRev = primerRevSlic(seqz, propz, calcTm, data.overhang);
            var primersVec = primerBasic(seqz.vec5 + seqz.vec3, propz, calcTm);
            var primers = [
                {
                    name: "Insert forward primer",
                    seq: primerInsFor.full,
                    propz: calcTm(primerInsFor.onInsert, propz)
                },
                {
                    name: "Insert reverse primer",
                    seq: primerInsRev.full,
                    propz: calcTm(primerInsRev.onInsert, propz)
                },
                {
                    name: "Vector forward primer",
                    seq: primersVec.for,
                    propz: calcTm(primersVec.for, propz)
                },
                {
                    name: "Vector reverse primer",
                    seq: primersVec.rev,
                    propz: calcTm(primersVec.rev, propz)
                }
            ];
            break; 
    };

    // Fill in primers field and info field
    columns = $("#primersInfo .column")
    console.log(columns)
    primersField = ""
    primers.forEach(function(primer, i){
        name = ">" + primer.name.split(" ").join("_");
        seq = primer.seq;
        primersField += name + "\n" + seq + "\n\n";

    });
    $("#primersField").val(primersField);

    // $("#info1 #headerInfo").text("Forward primer");
    // $("#info1 #info").html("<p><strong>Tm: </strong>" + tmFor + " °C</p><p><strong>H: </strong>" + hFor + "</p><p><strong>S: </strong>" + sFor + "</p><p><strong>GC-content: </strong>" + gcFor + "%</p>");
    // $("#info2 #headerInfo").text("Reverse primer");
    // $("#info2 #info").html("<p><strong>Tm: </strong>" + tmRev + " °C</p><p><strong>H: </strong>" + hRev + "</p><p><strong>S: </strong>" + sRev + "</p><p><strong>GC-content: </strong>" + gcRev + "%</p>");

    // Display primer and info field
    $("#primersField").css("display", "block");
    $("#primersInfo").css("display", "block");

    // Scroll the page down
    var dist = $(document).height();
    $('html, body').animate({ scrollTop: dist }, 1000);
});
// <p></p>
// console.log(primerForSlic(insert, vector5Prime, propz, method));
