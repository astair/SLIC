// TODO
// info popups
// vector svg
// download button


$(".ui.dropdown")
    .dropdown()
;

$("#method").change(function(){
    switch ($(this).val()){
        case "BS":
            $("#conc input").prop('disabled', false);
            break;
        case "RT":
            $("#conc input").prop('disabled', true);
            break;
    };
});


// Set pattern for DNA -> message
$("input.dna").on("invalid", function(event){
    event.target.setCustomValidity("Expected DNA sequence as input.");
}).bind("blur", function(event){
    event.target.setCustomValidity("");
});

// Message for numbers 
$(".right.labeled.input input").on("invalid", function(event){
    event.target.setCustomValidity("Expected an integer number as input.");
}).bind("blur", function(event){
    event.target.setCustomValidity("");
});

// Event liserner on SUBMIT:
// This is, where all the stuff happens
$("form").on("submit",  function(event){
    event.preventDefault();

    // Get rid of error
    $(".error.message").css("display", "none");
    $(".warning.message").css("display", "none");
    $(".text").css("display", "none");
    $(".icon").removeClass("active");

    // Handle input data and convert to object
    var data = $(this).serializeArray().reduce(function(obj, item){
        obj[item.name] = item.value;
        return obj;
    }, {});

    // Propz object holds the chosen reaction conditions 
    var propz = {
        Tm: Number(data.tmMin),
        concDNA: Number(data.concDNA),
        concNa: Number(data.concNa),
        concMg: Number(data.concMg),
        overhangLength: Number(data.overhangLength)
    };

    // Get the sequences and store in seqz object because it's more shizzle like that
    var seqz = {
        ins: formatSeq(data.insert.toUpperCase()),
        vec5: formatSeq(data.vector5.toUpperCase()),
        vec3: formatSeq(data.vector3.toUpperCase())
    };

    // Evaluate the Tm calculation method of choice
    switch (data.method){
        case "BS":
            var calcTm = calcTmBaseStacking;
            break;
        case "RT":
            var calcTm = calcTmBasic;
            break;      
    };

    // ERROR HANDELING
    // Switch through seqs
    errorMessage = "Unfortunately, your {0} sequence is too short to achive the desired T<sub>m</sub>."
    if (!extendToTm(seqz.ins, propz, calcTm)){
        errSeq = "insert";
        $(".error.message .header strong").html(errorMessage.format(errSeq));
        $(".error.message").css("display", "block");
        throw "Input Error: " + errorMessage.format(errSeq);       
    } else if (!extendToTm(seqz.vec5, propz, calcTm)){
        errSeq = "vector 5'";
        $(".error.message .header strong").html(errorMessage.format(errSeq));
        $(".error.message").css("display", "block");
        throw "Input Error: " + errorMessage.format(errSeq);       
    } else if (!extendToTm(seqz.vec3, propz, calcTm)){
        errSeq = "vector 3'";
        $(".error.message .header strong").html(errorMessage.format(errSeq));
        $(".error.message").css("display", "block");
        throw "Input Error: " + errorMessage.format(errSeq);       
    };     

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
                    overhang: primerVecFor.onInsert,
                    propz: calcTm(primerVecFor.onVector, propz)
                },
                {
                    name: "Vector reverse primer",
                    seq: primerVecRev.full,
                    overhang: primerVecRev.onInsert,
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
            var primerInsFor = primerForSlic(seqz, propz, calcTm, data.overhang, data.overhangLength);
            var primerInsRev = primerRevSlic(seqz, propz, calcTm, data.overhang,data.overhangLength);
            var primersVec = primerBasic(seqz.vec5 + seqz.vec3, propz, calcTm);
            var primers = [
                {
                    name: "Insert forward primer",
                    seq: primerInsFor.full,
                    overhang: primerInsFor.onVector,
                    propz: calcTm(primerInsFor.onInsert, propz)
                },
                {
                    name: "Insert reverse primer",
                    seq: primerInsRev.full,
                    overhang: primerInsRev.onVector,
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
    headers = $("#primersInfo .header");
    infos = $("#primersInfo .info");
    primersField = ""
    primers.forEach(function(primer, i){
        name = ">" + primer.name.split(" ").join("_");
        seq = primer.seq;
        primersField += name + "\n" + seq + "\n\n";
        $(headers[i]).html(primer.name);
        l = "<p><strong>Length: </strong>" + primer.seq.length + "</p>";
        gc = "<p><strong>GC-content: </strong>" + roundTwo(gcContent(primer.seq) * 100) + "%</p>";
        if (i < 2){
            tmPrim = "<p><strong>T<sub>m</sub> (main primer): </strong>" + roundTwo(primer.propz.Tm) + " °C</p>";                
            tmOv = "<p><strong>T<sub>m</sub> (overhang): </strong>" + roundTwo(calcTm(primer.overhang, propz).Tm) + " °C</p>";
            $(infos[i]).html(tmPrim + tmOv + l + gc);
        } else {
            tm = "<p><strong>T<sub>m</sub>: </strong>" + roundTwo(primer.propz.Tm) + " °C</p>";        
            $(infos[i]).html(tm + l + gc);
        }
    });
    $("#primersField").val(primersField);

    // Display primer and info field
    $("#primersField").css("display", "block");
    $("#primersInfo").css("display", "block");

    // Display warning message for overhang Tm > 60°C
    if (calcTm(primers[0].overhang, propz).Tm > 60 || calcTm(primers[1].overhang, propz).Tm > 60){
        $(".warning.message .header strong").html("The T<sub>m</sub> of the overhang is above 60 °C!");
        $(".warning.message").css("display", "block");
    };

    // Scroll the page down
    $("#primersField").scrollView();
});

// Tm and SLIC info
$(".idea.infoButton").on("click", function(event){
    $(".infoButton").removeClass("active");
    $(this).addClass("active");
    $(".ui.one .column.text").css("display", "none");
    $("#infoText").css("display", "block");
    $(this).scrollView();
});

$(".help.infoButton").on("click", function(event){
    $(".infoButton").removeClass("active");
    $(this).addClass("active");
    $(".idea.infoButton").addClass("active");
    $(".ui.one .column.text").css("display", "none");
    $("#infoText").css("display", "block");
    $("#tmText").scrollView();
});

// References 
$(".student.infoButton").on("click", function(event){
    $(".infoButton").removeClass("active");
    $(this).addClass("active");
    $(".ui.one .column.text").css("display", "none");
    $("#referenceText").css("display", "block");
    $(this).scrollView();
});

$(".ref").on("click", function(event){
    $(".infoButton").removeClass("active");
    $(".student.infoButton").addClass("active");
    $(".ui.one .column.text").css("display", "none");
    $("#referenceText").css("display", "block");
    $(".student.infoButton").scrollView();
});

// Protocol
$(".lab.infoButton").on("click", function(event){
    $(".infoButton").removeClass("active");
    $(this).addClass("active");
    $(".ui.one .column.text").css("display", "none");
    $("#protocolText").css("display", "block");
    $(this).scrollView();
});


