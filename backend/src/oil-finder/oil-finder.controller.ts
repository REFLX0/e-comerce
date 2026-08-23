import { Controller, Get, Query, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { OilFinderService } from './oil-finder.service';
import { ProductsService } from '../products/products.service';

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

@ApiTags('oil-finder')
@Controller('oil-finder')
export class OilFinderController {
  constructor(
    private readonly oilFinderService: OilFinderService,
    private readonly productsService: ProductsService,
  ) {}

  @Get('vehicle')
  async findByVehicle(
    @Query('make') make: string,
    @Query('model') model: string,
    @Query('engineCode') engineCode?: string,
  ) {
    if (!make || !model) return { data: [], total: 0 };
    
    const result = await this.oilFinderService.findByVehicle(make, model, engineCode);
    if (result.status !== 'found') {
      return { data: [], total: 0, status: result.status };
    }

    let productsResult = await this.productsService.findAll({
      viscosity: result.oilSpec.viscosity,
      acea: result.oilSpec.aceaStandard ?? undefined,
      api: result.oilSpec.apiStandard ?? undefined,
      oem: result.oilSpec.oemApproval ?? undefined,
      categorySlug: 'huiles-moteur', // Ensure we only return oils
    });

    if (productsResult.total === 0 && result.oilSpec.oemApproval) {
      productsResult = await this.productsService.findAll({
        viscosity: result.oilSpec.viscosity,
        acea: result.oilSpec.aceaStandard ?? undefined,
        api: result.oilSpec.apiStandard ?? undefined,
        categorySlug: 'huiles-moteur',
      });
    }

    if (productsResult.total === 0 && result.oilSpec.apiStandard && result.oilSpec.aceaStandard) {
      productsResult = await this.productsService.findAll({
        viscosity: result.oilSpec.viscosity,
        acea: result.oilSpec.aceaStandard ?? undefined,
        categorySlug: 'huiles-moteur',
      });
    }

    if (productsResult.total === 0) {
      productsResult = await this.productsService.findAll({
        viscosity: result.oilSpec.viscosity,
        categorySlug: 'huiles-moteur',
      });
    }

    return {
      ...productsResult,
      oilFinderStatus: result.status,
      oilSpec: result.oilSpec,
    };
  }

  @Get('specs')
  async findByCharacteristics(
    @Query('displacementCc') displacementCc: string,
    @Query('powerHp') powerHp: string,
    @Query('fuelType') fuelType: string,
  ) {
    if (!displacementCc || !powerHp || !fuelType) return { data: [], total: 0 };

    const result = await this.oilFinderService.findByCharacteristics(
      Number(displacementCc),
      Number(powerHp),
      fuelType,
    );

    if (result.status !== 'found') {
      return { data: [], total: 0, status: result.status };
    }

    let productsResult = await this.productsService.findAll({
      viscosity: result.oilSpec.viscosity,
      acea: result.oilSpec.aceaStandard ?? undefined,
      api: result.oilSpec.apiStandard ?? undefined,
      oem: result.oilSpec.oemApproval ?? undefined,
      categorySlug: 'huiles-moteur',
    });

    if (productsResult.total === 0 && result.oilSpec.oemApproval) {
      productsResult = await this.productsService.findAll({
        viscosity: result.oilSpec.viscosity,
        acea: result.oilSpec.aceaStandard ?? undefined,
        api: result.oilSpec.apiStandard ?? undefined,
        categorySlug: 'huiles-moteur',
      });
    }

    if (productsResult.total === 0 && result.oilSpec.apiStandard && result.oilSpec.aceaStandard) {
      productsResult = await this.productsService.findAll({
        viscosity: result.oilSpec.viscosity,
        acea: result.oilSpec.aceaStandard ?? undefined,
        categorySlug: 'huiles-moteur',
      });
    }

    if (productsResult.total === 0) {
      productsResult = await this.productsService.findAll({
        viscosity: result.oilSpec.viscosity,
        categorySlug: 'huiles-moteur',
      });
    }

    return {
      ...productsResult,
      oilFinderStatus: result.status,
      oilSpec: result.oilSpec,
    };
  }

  @Get('makes')
  async getMakes(@Query('category') category?: string) {
    return this.oilFinderService.getMakes(category);
  }

  @Get('makes/:make/models')
  async getModels(@Param('make') make: string) {
    return this.oilFinderService.getModels(make);
  }

  @Get('models/:make/:model/engines')
  async getEngines(
    @Param('make') make: string,
    @Param('model') model: string,
  ) {
    return this.oilFinderService.getEngines(make, model);
  }

  @Get('ai-recommendation')
  async getAIRecommendation(
    @Query('make') make: string,
    @Query('model') model: string,
    @Query('engineCode') engineCode?: string,
  ) {
    if (!OPENROUTER_API_KEY) {
      return { recommendation: "L'assistant IA n'est pas configuré." };
    }

    const vehicleStr = `${make} ${model} ${engineCode || ''}`.trim();
    const prompt = `Tu es un expert mécanicien pour Specpart. Un client cherche de l'huile pour le véhicule suivant : ${vehicleStr}. 
Donne-lui brièvement les spécifications d'huile recommandées (Viscosité, ACEA, API, approbations constructeurs) en 2 ou 3 phrases maximum.
Ensuite, ajoute OBLIGATOIREMENT le texte suivant à la fin : "Nous n'avons pas de produit compatible en stock pour le moment, mais vous pouvez contacter Specpart pour faire une commande spéciale."`;

    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'http://localhost:8082',
          'X-Title': 'Specpart Oil Finder',
        },
        body: JSON.stringify({
          model: 'openai/gpt-4o-mini',
          messages: [
            { role: 'system', content: prompt }
          ]
        })
      });

      if (!response.ok) {
        throw new Error('OpenRouter API error');
      }

      const data = await response.json();
      return { recommendation: data.choices[0].message.content };
    } catch (error) {
      return { recommendation: "L'assistant IA est temporairement indisponible. Veuillez contacter Specpart." };
    }
  }
}
