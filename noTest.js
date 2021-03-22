const {
    getSignature,
    createSignature,
    getAllSignatures,
} = require("./signatures");

const allSignatures = require("./queryAllSignatures");

const expectedOutput = {
    id: 1,
    first_name: "Martin",
    last_name: "Perez",
    text_signature:
        "EFRQWETQERQERQRFQERQETE$TRQ@#RTGWERTGWRTQ$@TQTQ@#TQWGTQGQ#WRQWEGQWRTGQWRTGQWRTGQ#W$RTQTWTQGWRTQGWRTQWRTGQW#E$GQREQEQEQEGQWERQGWERQWGRQWQ#Q#WQ#",
    created_at: "2021-03-11T19:28:37.310Z",
};

test("Test query one signature by ID", () => {
    const _id = 1;
    return getSignature(_id)
        .then((data) => {
            expect(data.toISOString()).toBe(expectedOutput);
        })
        .catch((error) => console.log(error));
});

test("All signatures returned", () => {
    return getAllSignatures().then((data) => {
        data.map((signature) => {
            return (signature.created_at = `${signature.created_at.toISOString()}`);
        });
        expect(data).toEqual(allSignatures);
    });
});

test("A signature is created", () => {
    const first_name = "Mark";
    const last_name = "Hamill";
    const signature = "This is a very long sting indeed";
    const expectedOutput = 66; //next id in DDBB
    return createSignature(first_name, last_name, signature).then((data) => {
        expect(data).toBe(expectedOutput);
    });
});
