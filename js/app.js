$(document).ready(function () {
    cardapio.eventos.init();
})

var cardapio = {};

var MEU_CARRINHO = [];
var MEU_ENDERECO = null;

var VALOR_CARRINHO = 0;
var VALOR_ENTREGA = 3;

var CELULAR_EMPRESA = '5588981181120';

var cardapio = {}; // Certifique-se de que `cardapio` está definido

cardapio.eventos = {
    init: () => {
        cardapio.metodos.obterItensCardapio();
        cardapio.metodos.carregarBotaoLigar();
        cardapio.metodos.carregarBotaoReserva();
    }
}


cardapio.metodos = {

    // obtem a lista de intens do cardápio
    obterItensCardapio: (categoria = 'burgers-premium', vermais = false) => {
        var filtro = MENU[categoria];
        console.log(filtro);

        if (!vermais) {
            $("#itensCardapio").html('');
            $("#btnVerMais").removeClass('d-none');
        }

        $.each(filtro, (i, e) => {
            let temp = cardapio.templetes.item.replace(/\${img}/g, e.img)
                .replace(/\${nome}/g, e.name)
                .replace(/\${preco}/g, e.price.toFixed(2).replace('.', ','))
                .replace(/\${id}/g, e.id);

            if (vermais && i >= 8 && i < 12) {
                $("#itensCardapio").append(temp);
            }

            if (!vermais && i < 8) {
                $("#itensCardapio").append(temp);
            }
        });

        $(".container-menu a").removeClass('active');
        $("#menu-" + categoria).addClass('active');
    },

    // Clique no botão de ver mais
    verMais: () => {
        var ativo = $(".container-menu a.active").attr('id').split('menu-')[1];
        cardapio.metodos.obterItensCardapio(ativo, true);
        $("#btnVerMais").addClass('d-none');
    },

    // diminuir a quntidade do item no cardapio
    diminuirQuantidade: (id) => {
        let qntdAtual = parseInt($("#qntd-" + id).text());
        if (qntdAtual > 0) {
            $("#qntd-" + id).text(qntdAtual - 1);
        }
    },

    // aumentar a qunatidade do item no cardapio
    aumentarQuantidade: (id) => {
        let qntdAtual = parseInt($("#qntd-" + id).text());
        $("#qntd-" + id).text(qntdAtual + 1);
    },

    // adicionar ao carrinho o item do cardápio
    adicionarAoCarrinho: (id) => {
        let qntdAtual = parseInt($("#qntd-" + id).text());

        if (qntdAtual > 0) {
            var activeElement = $(".container-menu a.active").attr('id');
            if (!activeElement) {
                console.error("Elemento ativo não encontrado");
                return;
            }
            var categoria = activeElement.split('menu-')[1];
            let filtro = MENU[categoria];
            let item = $.grep(filtro, (e) => e.id == id);

            // caso já exista o item no carrinho, só alterar a quantidade
            if (item.length > 0) {
                let existingItem = MEU_CARRINHO.find(e => e.id == id);
                if (existingItem) {
                    existingItem.qntd += qntdAtual;
                // caso ainda não tenha o item no carrinho, adicionar ele
                } else {
                    item[0].qntd = qntdAtual;
                    MEU_CARRINHO.push(item[0]);
                }
            }

            cardapio.metodos.mensagem('item adicionada ao carrinho', 'green')
            $("#qntd-" + id).text(0);
            cardapio.metodos.atualizarBadgeTotal();
        }
    },


    // atualizar o badge de totais dos botões "meu carrinho"
    atualizarBadgeTotal: () => {
        var total = 0;

        $.each(MEU_CARRINHO, (i, e) => {
            total += e.qntd;
        });

        if (total > 0) {
            $(".botao-carrinho").removeClass('d-none');
            $(".container-total-carrinho").removeClass('d-none');
        } else {
            $(".botao-carrinho").addClass('d-none');
            $(".container-total-carrinho").addClass('d-none');
        }

        $(".badge-total-carrinho").html(total);
    },

    //abrir a modol de carrinho
    abrirCarrinho: (abrir) => {

        if (abrir) {
            $("#modalCarrinho").removeClass('hidden');
            cardapio.metodos.carregarCarrinho();
        }
        else {
            $("#modalCarrinho").addClass('hidden');
        }

    },

    // altera os textos e xibe os botões das etapas
    carregarEtapa: (etapa) => {

        if (etapa == 1) {
            $("#lblTituloEtapa").text('Seu carrinho:');
            $("#itensCarrinho").removeClass('hidden');
            $("#localEntrega").addClass('hidden');
            $("#resumoCarrinho").addClass('hidden');
    
            $(".etapa").removeClass('active');
            $(".etapa1").addClass('active');
            
    
            $("#btnEtapaPedido").removeClass('hidden');
            $("#btnEtapaEndereco").addClass('hidden');
            $("#btnEtapaResumo").addClass('hidden');
            $("#btnVoltar").addClass('hidden');
        }
    
        if (etapa == 2) {
            $("#lblTituloEtapa").text('Endereço de entrega:');
            $("#itensCarrinho").addClass('hidden');
            $("#localEntrega").removeClass('hidden');
            $("#resumoCarrinho").addClass('hidden');
    
            $(".etapa").removeClass('active');
            $(".etapa1").addClass('active');
            $(".etapa2").addClass('active');
    
            $("#btnEtapaPedido").addClass('hidden');
            $("#btnEtapaEndereco").removeClass('hidden');
            $("#btnEtapaResumo").addClass('hidden');
            $("#btnVoltar").removeClass('hidden');
        }
    
        if (etapa == 3) {
            $("#lblTituloEtapa").text('Resumo do pedido:');
            $("#itensCarrinho").addClass('hidden');
            $("#localEntrega").addClass('hidden');
            $("#resumoCarrinho").removeClass('hidden');
    
            $(".etapa").removeClass('active');
            $(".etapa1").addClass('active');
            $(".etapa2").addClass('active');
            $(".etapa3").addClass('active');
    
            $("#btnEtapaPedido").addClass('hidden');
            $("#btnEtapaEndereco").addClass('hidden');
            $("#btnEtapaResumo").removeClass('hidden');
            $("#btnVoltar").removeClass('hidden');
        }

    },


    // botão de voltar etapa
    voltarEtapa: () => {

        let etapa = $(".etapa.active").length;
        cardapio.metodos.carregarEtapa(etapa - 1);
        
    },

    // carrega a lista de itens do carrinho
    carregarCarrinho: () => {

        cardapio.metodos.carregarEtapa(1);

        if (MEU_CARRINHO.length > 0) {

            $("#itensCarrinho").html('');

            $.each(MEU_CARRINHO, (i, e) => {

                let temp = cardapio.templetes.itemCarrinho.replace(/\${img}/g, e.img)
                .replace(/\${nome}/g, e.name)
                .replace(/\${preco}/g, e.price.toFixed(2).replace('.', ','))
                .replace(/\${id}/g, e.id)
                .replace(/\${qntd}/g, e.qntd)

                $("#itensCarrinho").append(temp);

                // último item
                if ((i + 1) == MEU_CARRINHO.length) {
                    cardapio.metodos.carregarValores();
                }

            })

        }
        else {
            $("#itensCarrinho").html('<p class="carrinho-vazio"><i class="fa fa-shopping-bag"></i> Seu carrinho está vazio.</p>');
            cardapio.metodos.carregarValores();
        }

    },

    // dimunir quantidade do item do carrinho
    diminuirQuantidadeCarrinho: (id) => {

        let qntdAtual = parseInt($("#qntd-carrinho-" + id).text());

        if (qntdAtual > 1) {
            $("#qntd-carrinho-" + id).text(qntdAtual - 1);
            cardapio.metodos.atualizarCarrinho(id, qntdAtual - 1);
        }
        else {
          cardapio.metodos.removerItemCarrinho(id)
        }

    },

    // aumentar quantidade do item do carrinho
    aumentarQuantidadeCarrinho: (id) => {

        let qntdAtual = parseInt($("#qntd-carrinho-" + id).text());
        $("#qntd-carrinho-" + id).text(qntdAtual + 1);
        cardapio.metodos.atualizarCarrinho(id, qntdAtual + 1);

    },

    // botão remover item do carrinho
    removerItemCarrinho: (id) => {

        MEU_CARRINHO = $.grep(MEU_CARRINHO, (e, i) => { return e.id != id });
        cardapio.metodos.carregarCarrinho();

        // atualiza o botão carrinho com a quantidade atualizada
        cardapio.metodos.atualizarBadgeTotal();

    },

    // atualiza o carrinho com a quantidade atual
    atualizarCarrinho: (id, qntd) => {

        let objIndex = MEU_CARRINHO.findIndex((obj => obj.id ==id));
        MEU_CARRINHO[objIndex].qntd = qntd;

        // atualiza o botão carrinho com a quantidade atualizada
        cardapio.metodos.atualizarBadgeTotal();

        // atualiza os valores (R$) totais do carrinho
        cardapio.metodos.carregarValores();

    },

    // carrega os valores de sub total entrega e total
    carregarValores: () => {

        let VALOR_CARRINHO = 0;
    
        $("#lblSubtotal").text('R$ 0,00');
        $("#lblValorEntrega").text('+ R$ 0,00');
        $("#lblValorTotal").text('R$ 0,00');
    
        $.each(MEU_CARRINHO, (i, e) => {
            VALOR_CARRINHO += parseFloat(e.price) * parseInt(e.qntd);
        });
    
        $("#lblSubtotal").text(`R$ ${VALOR_CARRINHO.toFixed(2).replace('.', ',')}`);
        $("#lblValorEntrega").text(`+ R$ ${VALOR_ENTREGA.toFixed(2).replace('.', ',')}`);
        $("#lblValorTotal").text(`R$ ${(VALOR_CARRINHO + VALOR_ENTREGA).toFixed(2).replace('.', ',')}`);
    },

    // carregar a etapa endereço
    carregarEndereco: () => {

        if (MEU_CARRINHO.length <= 0) {
            cardapio.metodos.mensagem('Seu carrinho está vazio.');
            return;
        }

        cardapio.metodos.carregarEtapa(2);

    },

    // API ViaCEP
    buscarCep: () => {

        // cria uma variavel com o valor do cep
        var cep = $("#txtCEP").val().trim().replace(/\D/g, '');

        // verifica se o cep possui valor informado
        if (cep != "") {

            // Expresão regular para validar o CEP
            var validacep = /^[0-9]{8}$/;

            if (validacep.test(cep)){

                $.getJSON("https://viacep.com.br/ws/" + cep + "/json/?callback=?", function(dados) {

                    if (!("erro" in dados)) {

                        // atualizar os campos com os valores retornados
                        $("#txtEndereco").val(dados.logradouro);
                        $("#txtBairro").val(dados.bairro);
                        $("#txtCidade").val(dados.localidade);
                        $("#ddlUf").val(dados.uf);
                        $("#txtNumero").focus();

                    }
                    else {
                        cardapio.metodos.mensagem('CEP Não encontrado. Preencha as informações manualmente.');
                        $("#txtEndereco").focus();
                    }

                })

            }
            else {
                cardapio.metodos.mensagem('Formato do CEP inválido.');
                $("#txtCEP").focus();
            }

        }
        else {
            cardapio.metodos.mensagem('Informa o CEP por favor.');
            $("#txtCEP").focus();
        }

    },

    // calidação antes de proceguir para a etapa 3
    buscarCep: () => {
        // cria uma variavel com o valor do cep
        var cep = $("#txtCEP").val().trim().replace(/\D/g, '');
    
        // verifica se o cep possui valor informado
        if (cep != "") {
            // Expressão regular para validar o CEP
            var validacep = /^[0-9]{8}$/;
    
            if (validacep.test(cep)) {
                $.getJSON(`https://viacep.com.br/ws/${cep}/json/?callback=?`, function(dados) {
                    if (!("erro" in dados)) {
                        // atualizar os campos com os valores retornados
                        $("#txtEndereco").val(dados.logradouro);
                        $("#txtBairro").val(dados.bairro);
                        $("#txtCidade").val(dados.localidade);
                        $("#ddlUf").val(dados.uf);
                        $("#txtNumero").focus();
                    } else {
                        cardapio.metodos.mensagem('CEP Não encontrado. Preencha as informações manualmente.');
                        $("#txtEndereco").focus();
                    }
                });
            } else {
                cardapio.metodos.mensagem('Formato do CEP inválido.');
                $("#txtCEP").focus();
            }
        } else {
            cardapio.metodos.mensagem('Informe o CEP, por favor.');
            $("#txtCEP").focus();
        }
    },
    
    // validação antes de prosseguir para a etapa 3
    resumoPedido: () => {

        let cep = $("#txtCEP").val().trim();
        let endereco = $("#txtEndereco").val().trim();
        let bairro = $("#txtBairro").val().trim();
        let cidade = $("#txtCidade").val().trim();
        let uf = $("#ddlUf").val().trim();
        let numero = $("#txtNumero").val().trim();
        let complemento = $("#txtComplemento").val().trim();
    
        if (cep.length <= 0) {
            cardapio.metodos.mensagem('Informe o CEP, por favor');
            $("#txtCEP").focus();
            return;
        }
    
        if (endereco.length <= 0) {
            cardapio.metodos.mensagem('Informe o Endereço, por favor');
            $("#txtEndereco").focus();
            return;
        }
    
        if (bairro.length <= 0) {
            cardapio.metodos.mensagem('Informe o Bairro, por favor');
            $("#txtBairro").focus();
            return;
        }
    
        if (cidade.length <= 0) {
            cardapio.metodos.mensagem('Informe a Cidade, por favor');
            $("#txtCidade").focus();
            return;
        }
    
        if (uf == "-1") {
            cardapio.metodos.mensagem('Informe a UF, por favor');
            $("#ddlUf").focus();
            return;
        }
    
        if (numero.length <= 0) {
            cardapio.metodos.mensagem('Informe o Número, por favor');
            $("#txtNumero").focus();
            return;
        }
    
        MEU_ENDERECO = {
            cep: cep,
            endereco: endereco,
            bairro: bairro,
            cidade: cidade,
            uf: uf,
            numero: numero,
            complemento: complemento
        }
        

        cardapio.metodos.carregarEtapa(3);
        cardapio.metodos.carregarResumo();
    },

    // carrega a etapa de resumdo do pedido
    carregarResumo: () => {

        $("#listaItensResumo").html('');

        $.each(MEU_CARRINHO, (i, e) =>{

            let temp = cardapio.templetes.itemResumo.replace(/\${img}/g, e.img)
                .replace(/\${nome}/g, e.name)
                .replace(/\${preco}/g, e.price.toFixed(2).replace('.', ','))
                .replace(/\${qntd}/g, e.qntd)

            $("#listaItensResumo").append(temp);  

        });

        $("#resumoEndereco").html(`${MEU_ENDERECO.endereco}, ${MEU_ENDERECO.numero}, ${MEU_ENDERECO.bairro}`)
        $("#cidadeEndereco").html(`${MEU_ENDERECO.cidade}-${MEU_ENDERECO.uf} / ${MEU_ENDERECO.cep} ${MEU_ENDERECO.complemento}`)

        cardapio.metodos.finalizarPedido();

    },

    // atualiza o botão do WhatsApp
    finalizarPedido: () => {
        if (MEU_CARRINHO.length > 0 && MEU_ENDERECO != null) {
            // Capturar o valor do subtotal e o valor da entrega
            let valorSubtotal = parseFloat($("#lblSubtotal").text().replace('R$', '').replace(',', '.'));
            let valorEntrega = parseFloat($("#lblValorEntrega").text().replace('+ R$', '').replace(',', '.'));
            let valorTotalComEntrega = valorSubtotal + valorEntrega;
    
            // Formatação da mensagem
            var texto = 'Olá! gostaria de fazer um pedido:';
            texto += `\n*Itens do pedido:*\n\n\${itens}`;
            texto += '\n*Endereço de entrega:*';
            texto += `\n${MEU_ENDERECO.endereco}, ${MEU_ENDERECO.numero}, ${MEU_ENDERECO.bairro}`;
            texto += `\n${MEU_ENDERECO.cidade}-${MEU_ENDERECO.uf} / ${MEU_ENDERECO.cep} ${MEU_ENDERECO.complemento}`;
            texto += `\n\n*Total (com entrega): R$ ${(valorTotalComEntrega).toFixed(2).replace('.', ',')}*`;
    
            var itens = '';
    
            // Adicionar os itens do carrinho na mensagem
            $.each(MEU_CARRINHO, (i, e) => {
                itens += `*${e.qntd}X* ${e.name} ....... R$ ${e.price.toFixed(2).replace('.', ',')} \n`;
    
                // Último item
                if ((i + 1) == MEU_CARRINHO.length) {
                    texto = texto.replace(/\${itens}/g, itens);
                    console.log(texto);
    
                    // converte a URL
                    let encode = encodeURI(texto);
                    let URL = `https://wa.me/${CELULAR_EMPRESA}?text=${encode}`;         // URL para madar a lista para o WhatsApp

                    $("#btnEtapaResumo").attr('href', URL);

                }
            });
        } else {
            // Tratar o caso em que o carrinho está vazio ou o endereço não foi preenchido
            console.log("Carrinho vazio ou endereço não preenchido");
        }
    },

    // carrega o link do botão reserva
    carregarBotaoReserva: () => {

        var texto = 'Olá! gostaria de fazer uma *reserva*';

        let encode = encodeURI(texto);
        let URL = `https://wa.me/${CELULAR_EMPRESA}?text=${encode}`; 

        $("#btnReserva").attr('href', URL);

    },

    // carrega o botão de ligar
    carregarBotaoLigar: () => {

        $("#btnLigar").attr('href', `tel:${CELULAR_EMPRESA}`);

    },

    // abre o depoimento
    abrirDepoimento: (depoimentos) => {

        $("#depoimentos-1").addClass('hidden');
        $("#depoimentos-2").addClass('hidden');
        $("#depoimentos-3").addClass('hidden');

        $("#btnDepoimento-1").removeClass('active');
        $("#btnDepoimento-2").removeClass('active');
        $("#btnDepoimento-3").removeClass('active');

        $("#depoimentos-" + depoimentos).removeClass('hidden');
        $("#btnDepoimento-" + depoimentos).addClass('active');

    },

    //mensagens
    mensagem: (texto, cor = 'red', tempo = 3500) => {

        let id = Math.floor(Date.now() * Math.random()).toString();

        let msg = `<div id="msg-${id}" class="animated fadeInDown toast ${cor}">${texto}</div>`

        $("#container-mensagens").append(msg);

        setTimeout(() =>{
            $("#msg-" + id).removeClass('fadeInDown');
            $("#msg-" + id).addClass('fadeOutUp');
            setTimeout(() => {
                $("#msg-" + id).remove();
            }, 800);
        }, tempo)

    }

}

cardapio.templetes = {
    item: `
        <div class="col-12 col-lg-3 col-md-5 col-sm-6 mb-5 animated fadeInUp">
            <div class="card card-item" id="\${id}">
                <div class="img-produto">                         
                    <img src="\${img}">
                </div>
                <p class="title-produto text-center mt-4">
                    <b>\${nome}</b>                                   
                </p>
                <p class="price-produto text-center">             
                    <b>R$ \${preco}</b>
                </p>
                <div class="add-carrinho">
                    <span class="btn-menos" onclick="cardapio.metodos.diminuirQuantidade('\${id}')"><i class="fas fa-minus"></i></span>
                    <span class="add-numero-itens" id="qntd-\${id}">0</span>
                    <span class="btn-mais" onclick="cardapio.metodos.aumentarQuantidade('\${id}')"><i class="fas fa-plus"></i></span>
                    <span class="btn btn-add" onclick="cardapio.metodos.adicionarAoCarrinho('\${id}')"><i class="fa fa-shopping-bag"></i></span>
                </div>
            </div>
        </div>
    `,
                                                                            // <!-- inicio item carrinho -->
    itemCarrinho: ` 
        <div class="col-12 item-carrinho">                             
            <div class="img-produto">
                <img src="\${img}">
            </div>
            <div class="dados-produtos">
                <p class="title-produto"><b>\${nome}</b></p>
                <p class="price-produto"><b>R$ \${preco}</b></p>
            </div>
            <div class="add-carrinho">
                <span class="btn-menos" onclick="cardapio.metodos.diminuirQuantidadeCarrinho('\${id}')"><i class="fas fa-minus"></i></span>
                <span class="add-numero-itens" id="qntd-carrinho-\${id}">\${qntd}</span>
                <span class="btn-mais" onclick="cardapio.metodos.aumentarQuantidadeCarrinho('\${id}')"><i class="fas fa-plus"></i></span>
                <span class="btn btn-remove no-mobile" onclick="cardapio.metodos.removerItemCarrinho('\${id}')"><i class="fa fa-times"></i></span>
            </div>
    </div>                                                         
    `,
                                                                                //<!-- fim item carrinho -->

    itemResumo: `
    <div class="col-12 item-carrinho resumo">
        <div class="img-produto-resumo">
            <img src="\${img}">
        </div>
        <div class="dados-produtos">
            <p class="title-produto-resumo">
                <b>\${nome}</b>
            </p>
            <p class="price-produto-resumo">
                <b>R$ \${preco}</b>
            </p>
        </div>
        <p class="quantidade-produto-resumo">
            x <b>\${qntd}</b>
        </p>
    </div>
    `
}